#!/bin/sh

# Docker entrypoint script for Social Pro
# Handles startup procedures and health checks

set -e

# Configuration
APP_DIR="/app"
LOG_DIR="/app/logs"
PID_FILE="/app/app.pid"
HEALTH_CHECK_URL="http://localhost:3000/api/health"
STARTUP_TIMEOUT=60

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${GREEN}[${timestamp}]${NC} $message"
}

error() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${RED}[${timestamp} ERROR]${NC} $message" >&2
}

warning() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${YELLOW}[${timestamp} WARNING]${NC} $message"
}

info() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${BLUE}[${timestamp} INFO]${NC} $message"
}

# Check if environment variables are set
check_environment() {
    log "Checking environment configuration..."
    
    required_vars=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
    )
    
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            missing_vars+=("$var")
        fi
    done
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        error "Missing required environment variables:"
        printf '%s\n' "${missing_vars[@]}"
        exit 1
    fi
    
    log "Environment configuration validated"
}

# Create necessary directories
setup_directories() {
    log "Setting up directories..."
    
    # Create log directory
    mkdir -p "$LOG_DIR"
    chmod 755 "$LOG_DIR"
    
    # Create PID directory
    mkdir -p "$(dirname "$PID_FILE")"
    
    log "Directories setup completed"
}

# Wait for dependencies
wait_for_dependencies() {
    log "Waiting for dependencies..."
    
    # Wait for Redis
    if command -v redis-cli >/dev/null 2>&1; then
        info "Waiting for Redis..."
        timeout=30
        while ! redis-cli -h redis -p 6379 ping >/dev/null 2>&1; do
            if [[ $timeout -le 0 ]]; then
                error "Timeout waiting for Redis"
                exit 1
            fi
            sleep 2
            timeout=$((timeout - 2))
        done
        log "Redis is ready"
    fi
    
    # Wait for Database
    if command -v pg_isready >/dev/null 2>&1; then
        info "Waiting for database..."
        timeout=60
        while ! pg_isready -h supabase -p 5432 >/dev/null 2>&1; do
            if [[ $timeout -le 0 ]]; then
                error "Timeout waiting for database"
                exit 1
            fi
            sleep 3
            timeout=$((timeout - 3))
        done
        log "Database is ready"
    fi
    
    log "All dependencies are ready"
}

# Start the application
start_application() {
    log "Starting Social Pro application..."
    
    # Set environment variables
    export NODE_ENV=${NODE_ENV:-production}
    export PORT=3000
    export HOST=0.0.0.0
    
    # Start Next.js application
    log "Launching Next.js server..."
    
    # Start the application in background and save PID
    node server.js > "$LOG_DIR/app.log" 2>&1 &
    echo $! > "$PID_FILE"
    
    local app_pid=$!
    log "Application started with PID: $app_pid"
    
    # Wait for application to be ready
    wait_for_app_startup
    
    log "Application startup completed"
}

# Wait for application to be ready
wait_for_app_startup() {
    log "Waiting for application to be ready..."
    
    local timeout=$STARTUP_TIMEOUT
    local attempt=1
    
    while [[ $timeout -gt 0 ]]; do
        if curl -f -s "$HEALTH_CHECK_URL" >/dev/null 2>&1; then
            log "Application is ready and healthy"
            return 0
        fi
        
        # Check if process is still running
        if ! kill -0 "$(cat "$PID_FILE" 2>/dev/null)" >/dev/null 2>&1; then
            error "Application process died during startup"
            exit 1
        fi
        
        info "Waiting for application... (attempt $attempt, ${timeout}s remaining)"
        sleep 5
        timeout=$((timeout - 5))
        attempt=$((attempt + 1))
    done
    
    error "Application failed to start within $STARTUP_TIMEOUT seconds"
    show_logs
    exit 1
}

# Show recent logs
show_logs() {
    if [[ -f "$LOG_DIR/app.log" ]]; then
        echo -e "${RED}Recent application logs:${NC}"
        tail -n 20 "$LOG_DIR/app.log"
    fi
}

# Setup signal handlers
setup_signal_handlers() {
    # Handle graceful shutdown
    trap 'graceful_shutdown' TERM INT
}

# Graceful shutdown
graceful_shutdown() {
    log "Received shutdown signal, performing graceful shutdown..."
    
    # Stop the application
    if [[ -f "$PID_FILE" ]]; then
        local app_pid=$(cat "$PID_FILE")
        if kill -0 "$app_pid" >/dev/null 2>&1; then
            log "Stopping application (PID: $app_pid)..."
            kill -TERM "$app_pid"
            
            # Wait for graceful shutdown
            local timeout=30
            while kill -0 "$app_pid" >/dev/null 2>&1 && [[ $timeout -gt 0 ]]; do
                sleep 1
                timeout=$((timeout - 1))
            done
            
            # Force kill if still running
            if kill -0 "$app_pid" >/dev/null 2>&1; then
                warning "Force killing application process"
                kill -KILL "$app_pid"
            fi
        fi
        
        # Clean up PID file
        rm -f "$PID_FILE"
    fi
    
    log "Graceful shutdown completed"
    exit 0
}

# Health check function
health_check() {
    if curl -f -s "$HEALTH_CHECK_URL" >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Main function
main() {
    log "Starting Social Pro container..."
    
    # Setup
    check_environment
    setup_directories
    setup_signal_handlers
    
    # Wait for dependencies
    wait_for_dependencies
    
    # Start application
    start_application
    
    # Keep container running and monitor health
    log "Container is running, monitoring application health..."
    
    while true; do
        if ! health_check; then
            error "Health check failed"
            show_logs
            exit 1
        fi
        
        sleep 30
    done
}

# Handle script arguments
case "${1:-}" in
    --health)
        health_check
        exit $?
        ;;
    --help|-h)
        echo "Social Pro Docker Entry Point"
        echo ""
        echo "Usage: $0 [option]"
        echo ""
        echo "Options:"
        echo "  --health    Run health check"
        echo "  --help      Show this help"
        echo ""
        echo "Environment Variables:"
        echo "  NEXT_PUBLIC_SUPABASE_URL"
        echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY"
        echo "  SUPABASE_SERVICE_ROLE_KEY"
        echo "  NODE_ENV"
        exit 0
        ;;
    *)
        main
        ;;
esac
