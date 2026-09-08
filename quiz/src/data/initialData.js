export const DEFAULT_COMPANY = {
  name: 'TechStore & Soluciones S.A.',
  taxId: 'J-40123456-7',
  email: 'contacto@techstore.com',
  phone: '+57 (1) 745-8900',
  address: 'Av. Las Palmas #45-12, Oficina 502',
  city: 'Bogotá, Colombia',
}

export const INITIAL_INVOICES = [
  {
    id: 'inv-demo-0001',
    number: 'FAC-0001',
    issueDate: '2026-09-05',
    dueDate: '2026-09-20',
    status: 'paid', // 'paid' | 'pending'
    taxRate: 12,
    issuer: {
      name: DEFAULT_COMPANY.name,
      taxId: DEFAULT_COMPANY.taxId,
      email: DEFAULT_COMPANY.email,
      phone: DEFAULT_COMPANY.phone,
      address: DEFAULT_COMPANY.address,
    },
    client: {
      name: 'Constructora Alfa S.A.S.',
      taxId: '900.542.112-4',
      email: 'facturacion@constructoranacional.com',
      phone: '+57 310 445 6789',
      address: 'Calle 100 #15-31, Torre Norte',
    },
    items: [
      { id: 'item-1', description: 'Monitor Ultrawide 34" 4K IPS', quantity: 2, price: 340 },
      { id: 'item-2', description: 'Teclado Mecánico RGB Switch Brown', quantity: 4, price: 45 },
      { id: 'item-3', description: 'Mouse Ergonómico Inalámbrico', quantity: 4, price: 28 },
    ],
    notes: 'Pago recibido oportunamente vía transferencia bancaria. ¡Gracias por su compra!',
  },
  {
    id: 'inv-demo-0002',
    number: 'FAC-0002',
    issueDate: '2026-09-07',
    dueDate: '2026-09-22',
    status: 'pending',
    taxRate: 12,
    issuer: {
      name: DEFAULT_COMPANY.name,
      taxId: DEFAULT_COMPANY.taxId,
      email: DEFAULT_COMPANY.email,
      phone: DEFAULT_COMPANY.phone,
      address: DEFAULT_COMPANY.address,
    },
    client: {
      name: 'Dra. Valentina Osorio - Clínica Dental',
      taxId: 'CC 52.890.312',
      email: 'consultorio@odontoval.com',
      phone: '+57 320 889 1234',
      address: 'Cra 7 #120-20, Consultorio 401',
    },
    items: [
      { id: 'item-4', description: 'Servidor Mini NAS 8TB para copias de seguridad', quantity: 1, price: 620 },
      { id: 'item-5', description: 'Licencia Antivirus Endpoint Protection (Anual)', quantity: 3, price: 35 },
      { id: 'item-6', description: 'Instalación y configuración de red interna', quantity: 1, price: 150 },
    ],
    notes: 'Plazo de pago a 15 días calendario mediante consignación a cuenta corriente Bancolombia.',
  },
  {
    id: 'inv-demo-0003',
    number: 'FAC-0003',
    issueDate: '2026-09-08',
    dueDate: '2026-09-23',
    status: 'pending',
    taxRate: 16,
    issuer: {
      name: DEFAULT_COMPANY.name,
      taxId: DEFAULT_COMPANY.taxId,
      email: DEFAULT_COMPANY.email,
      phone: DEFAULT_COMPANY.phone,
      address: DEFAULT_COMPANY.address,
    },
    client: {
      name: 'Estudio de Diseño Prisma Creativo',
      taxId: '901.233.455-8',
      email: 'pagos@estudioprisma.co',
      phone: '+57 301 222 9988',
      address: 'Cra 15 #85-40',
    },
    items: [
      { id: 'item-7', description: 'Estación de Trabajo Core i9 64GB RAM RTX 4070', quantity: 1, price: 1850 },
      { id: 'item-8', description: 'Cable DisplayPort 1.4 de Alta Velocidad', quantity: 2, price: 18.5 },
    ],
    notes: 'Factura emitida para reposición de equipamiento gráfico.',
  },
]
