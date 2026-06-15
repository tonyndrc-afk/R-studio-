export interface BackgroundRemover { remove(inputPath:string): Promise<string>; }
export class MockBackgroundRemover implements BackgroundRemover { async remove(inputPath:string){ return inputPath; } }
