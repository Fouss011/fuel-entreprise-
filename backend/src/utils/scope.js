export function isSuperAdmin(req) {
  return req.user?.role === 'super_admin'
}

export function getUserStructureId(req) {
  return req.user?.structureId || req.user?.structure_id || null
}

export function getActiveStructureId(req) {
  return req.headers['x-active-structure-id'] || null
}

export function applyStructureScope(query, req) {
  if (isSuperAdmin(req)) {
    const activeStructureId = getActiveStructureId(req)

    if (!activeStructureId) {
      return query
    }

    return query.eq('structure_id', activeStructureId)
  }

  const structureId = getUserStructureId(req)

  if (!structureId) {
    return query.eq('structure_id', '__NO_STRUCTURE__')
  }

  return query.eq('structure_id', structureId)
}

export function resolveStructureIdForCreate(req, body = {}) {
  if (isSuperAdmin(req)) {
    return (
      body.structureId ||
      body.structure_id ||
      getActiveStructureId(req) ||
      null
    )
  }

  return getUserStructureId(req)
}