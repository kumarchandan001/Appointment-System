// client/js/provider.js
/**
 * Provider-specific Functions
 */

/**
 * Get current provider's own profile (if exists)
 */
async function getOwnProviderProfile() {
  try {
    const response = await fetch(`${window.API_BASE}/providers`, {
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch profile");
    }

    // Check if this is the provider's own profile
    if (data.isOwn) {
      return data;
    }

    return null;
  } catch (error) {
    console.error("Error fetching own profile:", error);
    return null;
  }
}

/**
 * Create provider profile
 */
async function createProviderProfile(title, specialties, services) {
  try {
    const response = await fetch(`${window.API_BASE}/providers`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        title,
        specialties: specialties.split(",").map((s) => s.trim()),
        services,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to create profile");
    }

    return data;
  } catch (error) {
    console.error("Error creating provider profile:", error);
    throw error;
  }
}

/**
 * Add appointment slots
 */
async function addSlots(providerId, slots) {
  try {
    const response = await fetch(`${window.API_BASE}/providers/${providerId}/slots`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ slots }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to add slots");
    }

    return data;
  } catch (error) {
    console.error("Error adding slots:", error);
    throw error;
  }
}

/**
 * Get provider data
 */
async function getProviderData(providerId) {
  try {
    const response = await fetch(`${window.API_BASE}/providers/${providerId}`, {
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch provider data");
    }

    return data;
  } catch (error) {
    console.error("Error fetching provider data:", error);
    throw error;
  }
}

/**
 * Confirm appointment
 */
async function confirmAppointment(appointmentId) {
  try {
    const response = await fetch(`${window.API_BASE}/appointments/${appointmentId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status: "confirmed" }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to confirm appointment");
    }

    return data;
  } catch (error) {
    console.error("Error confirming appointment:", error);
    throw error;
  }
}

/**
 * Reject appointment
 */
async function rejectAppointment(appointmentId) {
  try {
    const response = await fetch(`${window.API_BASE}/appointments/${appointmentId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status: "rejected" }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to reject appointment");
    }

    return data;
  } catch (error) {
    console.error("Error rejecting appointment:", error);
    throw error;
  }
}

/**
 * Get all appointments for provider
 */

async function getProviderAppointments() {
  try {
    const response = await fetch(`${window.API_BASE}/appointments`, {
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch appointments");
    }

    return data;
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
}
