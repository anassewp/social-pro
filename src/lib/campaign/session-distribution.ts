/**
 * توزيع الجلسات على الأعضاء
 */

import type { SessionStrategy } from './config'

export interface SessionInfo {
  id: string
  activityScore?: number // 0-100
  reliability?: number // 0-100
  currentLoad?: number // عدد الرسائل المرسلة حالياً
}

/**
 * توزيع الأعضاء على الجلسات
 */
export function distributeMembers(
  members: any[],
  sessions: SessionInfo[],
  strategy: SessionStrategy,
  minPerSession: number = 10
): Map<string, any[]> {
  if (sessions.length === 0) {
    throw new Error('يجب تحديد جلسة واحدة على الأقل')
  }

  if (sessions.length === 1) {
    // جلسة واحدة فقط - كل الأعضاء لها
    return new Map([[sessions[0].id, members]])
  }

  const distribution = new Map<string, any[]>()
  sessions.forEach(session => {
    distribution.set(session.id, [])
  })

  switch (strategy) {
    case 'equal':
      return distributeEqual(members, sessions, minPerSession)

    case 'random':
      return distributeRandom(members, sessions, minPerSession)

    case 'weighted':
      return distributeWeighted(members, sessions, minPerSession)

    default:
      return distributeEqual(members, sessions, minPerSession)
  }
}

/**
 * توزيع متساوي
 */
function distributeEqual(
  members: any[],
  sessions: SessionInfo[],
  minPerSession: number
): Map<string, any[]> {
  const distribution = new Map<string, any[]>()
  sessions.forEach(session => {
    distribution.set(session.id, [])
  })

  // ضمان الحد الأدنى لكل جلسة
  const minTotal = sessions.length * minPerSession
  if (members.length < minTotal) {
    // إذا كان عدد الأعضاء أقل من الحد الأدنى، وزع بالتساوي
    members.forEach((member, index) => {
      const sessionIndex = index % sessions.length
      const sessionId = sessions[sessionIndex].id
      distribution.get(sessionId)!.push(member)
    })
    return distribution
  }

  // توزيع متساوي مع ضمان الحد الأدنى
  let memberIndex = 0

  // أولاً: ضمان الحد الأدنى
  sessions.forEach((_, sessionIndex) => {
    for (let i = 0; i < minPerSession && memberIndex < members.length; i++) {
      distribution.get(sessions[sessionIndex].id)!.push(members[memberIndex])
      memberIndex++
    }
  })

  // ثانياً: توزيع الباقي بالتساوي
  while (memberIndex < members.length) {
    const sessionIndex = memberIndex % sessions.length
    distribution.get(sessions[sessionIndex].id)!.push(members[memberIndex])
    memberIndex++
  }

  return distribution
}

/**
 * توزيع عشوائي
 */
function distributeRandom(
  members: any[],
  sessions: SessionInfo[],
  minPerSession: number
): Map<string, any[]> {
  const distribution = new Map<string, any[]>()
  sessions.forEach(session => {
    distribution.set(session.id, [])
  })

  // نسخة من الأعضاء للخلط
  const shuffled = [...members].sort(() => Math.random() - 0.5)

  // ضمان الحد الأدنى
  const minTotal = sessions.length * minPerSession
  if (shuffled.length < minTotal) {
    shuffled.forEach((member, index) => {
      const sessionIndex = index % sessions.length
      distribution.get(sessions[sessionIndex].id)!.push(member)
    })
    return distribution
  }

  let memberIndex = 0

  // ضمان الحد الأدنى
  sessions.forEach((_, sessionIndex) => {
    for (let i = 0; i < minPerSession && memberIndex < shuffled.length; i++) {
      distribution.get(sessions[sessionIndex].id)!.push(shuffled[memberIndex])
      memberIndex++
    }
  })

  // توزيع الباقي عشوائياً
  while (memberIndex < shuffled.length) {
    const randomSessionIndex = Math.floor(Math.random() * sessions.length)
    distribution.get(sessions[randomSessionIndex].id)!.push(shuffled[memberIndex])
    memberIndex++
  }

  return distribution
}

/**
 * توزيع مرجح (weighted) حسب activityScore و reliability
 */
function distributeWeighted(
  members: any[],
  sessions: SessionInfo[],
  minPerSession: number
): Map<string, any[]> {
  const distribution = new Map<string, any[]>()
  sessions.forEach(session => {
    distribution.set(session.id, [])
  })

  // حساب الأوزان لكل جلسة
  const weights = sessions.map(session => {
    const activity = session.activityScore || 50 // افتراضي 50
    const reliability = session.reliability || 50 // افتراضي 50
    const load = session.currentLoad || 0
    
    // الوزن = (activity * 0.4 + reliability * 0.6) / (1 + load / 100)
    const weight = (activity * 0.4 + reliability * 0.6) / (1 + load / 100)
    return { sessionId: session.id, weight, index: sessions.indexOf(session) }
  })

  // تسوية الأوزان (normalize)
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0)
  const normalizedWeights = weights.map(w => ({
    ...w,
    normalizedWeight: w.weight / totalWeight
  }))

  // ضمان الحد الأدنى
  const minTotal = sessions.length * minPerSession
  if (members.length < minTotal) {
    members.forEach((member, index) => {
      const sessionIndex = index % sessions.length
      distribution.get(sessions[sessionIndex].id)!.push(member)
    })
    return distribution
  }

  let memberIndex = 0

  // ضمان الحد الأدنى لكل جلسة
  sessions.forEach((_, sessionIndex) => {
    for (let i = 0; i < minPerSession && memberIndex < members.length; i++) {
      distribution.get(sessions[sessionIndex].id)!.push(members[memberIndex])
      memberIndex++
    }
  })

  // توزيع الباقي حسب الأوزان
  while (memberIndex < members.length) {
    const random = Math.random()
    let cumulative = 0
    let selectedSessionIndex = 0

    for (const nw of normalizedWeights) {
      cumulative += nw.normalizedWeight
      if (random <= cumulative) {
        selectedSessionIndex = nw.index
        break
      }
    }

    distribution.get(sessions[selectedSessionIndex].id)!.push(members[memberIndex])
    memberIndex++
  }

  return distribution
}

