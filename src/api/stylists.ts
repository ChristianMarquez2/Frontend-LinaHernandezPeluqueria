import axios from 'axios';

// ✅ Base general
const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:4000/api/v1';

// ✅ Endpoint estilistas
const STYLISTS_URL = `${BASE_URL}/stylists`;

// ==============================
// 🔹 Obtener todos los estilistas
// ==============================
export async function getStylists() {
  const { data } = await axios.get(STYLISTS_URL);
  return data;
}

// ==============================
// 🔹 Crear un estilista
// ==============================
export async function createStylist(formData: any, token: string) {
  const { data } = await axios.post(
    STYLISTS_URL,
    {
      nombre: formData.firstName,
      apellido: formData.lastName,
      cedula: formData.cedula,
      telefono: formData.phone,
      genero:
        formData.gender === 'Masculino'
          ? 'M'
          : formData.gender === 'Femenino'
          ? 'F'
          : 'O',
      email: formData.email,
      password: formData.password,
      servicesOffered: [formData.service], // ID o nombre del servicio
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return data;
}

// ==============================
// 🔹 Actualizar servicios del estilista
// ==============================
export async function updateStylistServices(id: string, serviceId: string, token: string) {
  const { data } = await axios.put(
    `${STYLISTS_URL}/${id}/services`,
    { servicesOffered: [serviceId] },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
}

// ==============================
// 🔹 Desactivar (soft delete)
// ==============================
export async function deactivateStylist(id: string, token: string) {
  const { data } = await axios.put(
    `${BASE_URL}/users/${id}`, // ✅ usa BASE_URL, no ruta absoluta
    { isActive: false },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
}
