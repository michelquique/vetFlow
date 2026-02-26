import * as fs from 'fs';

export interface IdMapping {
  oldId: string;
  newId: string;
  entity: string;
}

export class IdMappingService {
  private mappings: Map<string, Map<string, string>> = new Map();

  constructor() {
    // Inicializar mapas para cada entidad
    this.mappings.set('doctors', new Map());
    this.mappings.set('clients', new Map());
    this.mappings.set('pets', new Map());
    this.mappings.set('species', new Map());
    this.mappings.set('breeds', new Map());
  }

  addMapping(entity: string, oldId: string, newId: string): void {
    if (!this.mappings.has(entity)) {
      this.mappings.set(entity, new Map());
    }
    this.mappings.get(entity)!.set(oldId.toString(), newId);
  }

  getMapping(entity: string, oldId: string): string | undefined {
    return this.mappings.get(entity)?.get(oldId.toString());
  }

  getMappingOrThrow(entity: string, oldId: string): string {
    const mapping = this.getMapping(entity, oldId);
    if (!mapping) {
      throw new Error(`No se encontró mapeo para ${entity} con ID antiguo: ${oldId}`);
    }
    return mapping;
  }

  async saveToFile(filePath: string): Promise<void> {
    const data: any = {};
    
    this.mappings.forEach((map, entity) => {
      data[entity] = Array.from(map.entries()).map(([oldId, newId]) => ({
        oldId,
        newId,
      }));
    });

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  getStatistics(): any {
    const stats: any = {};
    this.mappings.forEach((map, entity) => {
      stats[entity] = map.size;
    });
    return stats;
  }
}
