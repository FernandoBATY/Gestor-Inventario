export interface NegocioConfig {
  nombre_negocio: string;
  rfc: string;
  telefono: string;
  direccion: string;
  leyenda_ticket: string;
}

export const DEFAULT_NEGOCIO_CONFIG: NegocioConfig = {
  nombre_negocio: 'Papelería El Cuaderno Dorado',
  rfc: 'PAP980721-H89',
  telefono: '555-0192-384',
  direccion: 'Av. Principal No. 402, Centro',
  leyenda_ticket: '¡GRACIAS POR SU COMPRA!\nConserve este ticket para devoluciones o aclaraciones.'
};

let currentConfig: NegocioConfig = { ...DEFAULT_NEGOCIO_CONFIG };

export const negocioStore = {
  getConfig: () => currentConfig,
  updateConfig: (newConfig: Partial<NegocioConfig>) => {
    currentConfig = { ...currentConfig, ...newConfig };
    return currentConfig;
  }
};
