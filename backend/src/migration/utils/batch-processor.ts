export class BatchProcessor {
  constructor(private batchSize: number = 1000) {}

  async process<T>(
    items: T[],
    processor: (batch: T[]) => Promise<void>,
  ): Promise<void> {
    const totalBatches = Math.ceil(items.length / this.batchSize);

    for (let i = 0; i < items.length; i += this.batchSize) {
      const batch = items.slice(i, i + this.batchSize);
      const batchNumber = Math.floor(i / this.batchSize) + 1;
      
      console.log(`  Procesando lote ${batchNumber}/${totalBatches}...`);
      await processor(batch);
    }
  }

  async processWithRetry<T>(
    items: T[],
    processor: (batch: T[]) => Promise<void>,
    maxRetries: number = 3,
  ): Promise<void> {
    const totalBatches = Math.ceil(items.length / this.batchSize);

    for (let i = 0; i < items.length; i += this.batchSize) {
      const batch = items.slice(i, i + this.batchSize);
      const batchNumber = Math.floor(i / this.batchSize) + 1;
      
      let retries = 0;
      let success = false;

      while (!success && retries < maxRetries) {
        try {
          console.log(`  Procesando lote ${batchNumber}/${totalBatches}... (intento ${retries + 1})`);
          await processor(batch);
          success = true;
        } catch (error) {
          retries++;
          if (retries >= maxRetries) {
            throw new Error(`Lote ${batchNumber} falló después de ${maxRetries} intentos: ${error}`);
          }
          console.warn(`  Error en lote ${batchNumber}, reintentando...`);
          await this.sleep(1000 * retries); // Espera incremental
        }
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
