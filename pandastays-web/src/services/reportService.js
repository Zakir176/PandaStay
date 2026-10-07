import { supabase } from '../lib/supabaseClient'

/**
 * Maintenance & Reports Data Service
 * Handles maintenance tickets, prioritization, and status transitions.
 */

export const reportService = {
  /**
   * Fetch maintenance reports ordered by priority rank
   */
  async getReports() {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('priority_rank', { ascending: true })
    if (error) throw error
    return data || []
  },

  /**
   * Submit new maintenance ticket
   */
  async addReport({ propertyId, tenantId, description, category, photoUrl = null, priorityRank = 1 }) {
    const { data, error } = await supabase
      .from('reports')
      .insert({
        property_id: propertyId,
        tenant_id: tenantId,
        description,
        category,
        photo_url: photoUrl,
        status: 'open',
        priority_rank: Number(priorityRank)
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Update report status (open, in_progress, resolved)
   */
  async updateStatus(reportId, status) {
    const { data, error } = await supabase
      .from('reports')
      .update({ status })
      .eq('id', reportId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Update priority rank for ordering
   */
  async updatePriorityRank(reportId, priorityRank) {
    const { data, error } = await supabase
      .from('reports')
      .update({ priority_rank: Number(priorityRank) })
      .eq('id', reportId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}
