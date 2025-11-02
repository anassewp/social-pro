'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { BatchOperation, BatchStatus, BatchQueueItem } from '@/lib/types/batch';

interface BatchState {
  operations: Map<string, BatchOperation>;
  queue: BatchQueueItem[];
  isProcessing: boolean;
  progress: Map<string, number>;
  history: BatchOperation[];
  rollbacks: Map<string, any>;
}

type BatchAction =
  | { type: 'ADD_OPERATION'; operation: BatchOperation }
  | { type: 'UPDATE_OPERATION'; id: string; updates: Partial<BatchOperation> }
  | { type: 'REMOVE_OPERATION'; id: string }
  | { type: 'ADD_TO_QUEUE'; item: BatchQueueItem }
  | { type: 'PROCESS_QUEUE_ITEM'; item: BatchQueueItem }
  | { type: 'COMPLETE_QUEUE_ITEM'; id: string }
  | { type: 'SET_PROCESSING'; isProcessing: boolean }
  | { type: 'UPDATE_PROGRESS'; id: string; progress: number }
  | { type: 'ADD_TO_HISTORY'; operation: BatchOperation }
  | { type: 'ADD_ROLLBACK'; id: string; data: any }
  | { type: 'CLEAR_HISTORY' };

const initialState: BatchState = {
  operations: new Map(),
  queue: [],
  isProcessing: false,
  progress: new Map(),
  history: [],
  rollbacks: new Map(),
};

const batchReducer = (state: BatchState, action: BatchAction): BatchState => {
  switch (action.type) {
    case 'ADD_OPERATION':
      const newOperations = new Map(state.operations);
      newOperations.set(action.operation.id, action.operation);
      return { ...state, operations: newOperations };

    case 'UPDATE_OPERATION':
      const updatedOperations = new Map(state.operations);
      const existing = updatedOperations.get(action.id);
      if (existing) {
        updatedOperations.set(action.id, { ...existing, ...action.updates });
      }
      return { ...state, operations: updatedOperations };

    case 'REMOVE_OPERATION':
      const filteredOperations = new Map(state.operations);
      filteredOperations.delete(action.id);
      return { ...state, operations: filteredOperations };

    case 'ADD_TO_QUEUE':
      return { ...state, queue: [...state.queue, action.item] };

    case 'PROCESS_QUEUE_ITEM':
      return { ...state, queue: state.queue.filter(item => item.id !== action.item.id) };

    case 'COMPLETE_QUEUE_ITEM':
      return state;

    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.isProcessing };

    case 'UPDATE_PROGRESS':
      const newProgress = new Map(state.progress);
      newProgress.set(action.id, action.progress);
      return { ...state, progress: newProgress };

    case 'ADD_TO_HISTORY':
      return { ...state, history: [action.operation, ...state.history.slice(0, 99)] };

    case 'ADD_ROLLBACK':
      const newRollbacks = new Map(state.rollbacks);
      newRollbacks.set(action.id, action.data);
      return { ...state, rollbacks: newRollbacks };

    case 'CLEAR_HISTORY':
      return { ...state, history: [] };

    default:
      return state;
  }
};

interface BatchContextValue extends BatchState {
  addOperation: (operation: Omit<BatchOperation, 'id' | 'status' | 'createdAt'>) => string;
  updateOperation: (id: string, updates: Partial<BatchOperation>) => void;
  removeOperation: (id: string) => void;
  addToQueue: (item: Omit<BatchQueueItem, 'id'>) => string;
  processNextInQueue: () => Promise<void>;
  setProcessing: (isProcessing: boolean) => void;
  updateProgress: (id: string, progress: number) => void;
  addToHistory: (operation: BatchOperation) => void;
  addRollback: (id: string, data: any) => void;
  clearHistory: () => void;
  getOperation: (id: string) => BatchOperation | undefined;
  getQueueItem: (id: string) => BatchQueueItem | undefined;
}

const BatchContext = createContext<BatchContextValue | null>(null);

export const useBatch = () => {
  const context = useContext(BatchContext);
  if (!context) {
    throw new Error('useBatch must be used within BatchOperationsProvider');
  }
  return context;
};

interface BatchOperationsProviderProps {
  children: React.ReactNode;
  maxConcurrent?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export const BatchOperationsProvider: React.FC<BatchOperationsProviderProps> = ({
  children,
  maxConcurrent = 3,
  retryAttempts = 3,
  retryDelay = 1000,
}) => {
  const [state, dispatch] = useReducer(batchReducer, initialState);

  const addOperation = (operation: Omit<BatchOperation, 'id' | 'status' | 'createdAt'>): string => {
    const id = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newOperation: BatchOperation = {
      id,
      ...operation,
      status: 'pending',
      createdAt: new Date(),
    };

    dispatch({ type: 'ADD_OPERATION', operation: newOperation });
    return id;
  };

  const updateOperation = (id: string, updates: Partial<BatchOperation>) => {
    dispatch({ type: 'UPDATE_OPERATION', id, updates });
  };

  const removeOperation = (id: string) => {
    dispatch({ type: 'REMOVE_OPERATION', id });
  };

  const addToQueue = (item: Omit<BatchQueueItem, 'id'>): string => {
    const id = `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const queueItem: BatchQueueItem = {
      id,
      ...item,
    };

    dispatch({ type: 'ADD_TO_QUEUE', item: queueItem });
    return id;
  };

  const processNextInQueue = async (): Promise<void> => {
    if (state.isProcessing || state.queue.length === 0) {
      return;
    }

    const nextItem = state.queue[0];
    dispatch({ type: 'SET_PROCESSING', isProcessing: true });
    dispatch({ type: 'PROCESS_QUEUE_ITEM', item: nextItem });

    try {
      updateOperation(nextItem.operationId, { status: 'running' });
      
      // تنفيذ العملية
      if (nextItem.handler) {
        await nextItem.handler(nextItem.data);
      }

      // تحديث الحالة
      updateOperation(nextItem.operationId, { 
        status: 'completed',
        completedAt: new Date(),
      });
      
      dispatch({ type: 'UPDATE_PROGRESS', id: nextItem.operationId, progress: 100 });
    } catch (error) {
      updateOperation(nextItem.operationId, { 
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      dispatch({ type: 'SET_PROCESSING', isProcessing: false });
    }
  };

  const setProcessing = (isProcessing: boolean) => {
    dispatch({ type: 'SET_PROCESSING', isProcessing });
  };

  const updateProgress = (id: string, progress: number) => {
    dispatch({ type: 'UPDATE_PROGRESS', id, progress });
  };

  const addToHistory = (operation: BatchOperation) => {
    dispatch({ type: 'ADD_TO_HISTORY', operation });
  };

  const addRollback = (id: string, data: any) => {
    dispatch({ type: 'ADD_ROLLBACK', id, data });
  };

  const clearHistory = () => {
    dispatch({ type: 'CLEAR_HISTORY' });
  };

  const getOperation = (id: string): BatchOperation | undefined => {
    return state.operations.get(id);
  };

  const getQueueItem = (id: string): BatchQueueItem | undefined => {
    return state.queue.find(item => item.id === id);
  };

  // معالجة تلقائية للطابور
  useEffect(() => {
    if (!state.isProcessing && state.queue.length > 0) {
      processNextInQueue();
    }
  }, [state.queue.length, state.isProcessing]);

  const contextValue: BatchContextValue = {
    ...state,
    addOperation,
    updateOperation,
    removeOperation,
    addToQueue,
    processNextInQueue,
    setProcessing,
    updateProgress,
    addToHistory,
    addRollback,
    clearHistory,
    getOperation,
    getQueueItem,
  };

  return (
    <BatchContext.Provider value={contextValue}>
      {children}
    </BatchContext.Provider>
  );
};

export default BatchOperationsProvider;