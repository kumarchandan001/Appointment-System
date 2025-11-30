// client/js/patient.js
/**
 * Patient-specific Functions
 */

/**
 * List all providers
 */
async function listProviders() {
  try {
    const response = await fetch(`${window.API_BASE}/providers`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch providers');
    }

    return data;
  } catch (error) {
    console.error('Error fetching providers:', error);
    throw error;
  }
}

/**
 * Get provider availability
 */
async function getProviderAvailability(providerId) {
  try {
    const response = await fetch(`${window.API_BASE}/providers/${providerId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch availability');
    }

    return data;
  } catch (error) {
    console.error('Error fetching availability:', error);
    throw error;
  }
}

/**
 * Book appointment
 */
async function bookSlot(providerId, slotId, notes) {
  try {
    const response = await fetch(`${window.API_BASE}/appointments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        providerId,
        slotId,
        notes,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 409) {
        throw new Error('Slot is no longer available. Please select another.');
      }
      throw new Error(data.error || 'Failed to book appointment');
    }

    return data;
  } catch (error) {
    console.error('Error booking appointment:', error);
    throw error;
  }
}

/**
 * Get patient appointments
 */
async function getPatientAppointments() {
  try {
    const response = await fetch(`${window.API_BASE}/appointments`, {
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch appointments');
    }

    return data;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
}

/**
 * Cancel appointment
 */
async function cancelAppointment(appointmentId) {
  try {
    const response = await fetch(`${window.API_BASE}/appointments/${appointmentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to cancel appointment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    throw error;
  }
}
