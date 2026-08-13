export interface WidgetInterface {
    tagName: string
    sourceUrl?: string
    gridPosition: {
        col: number;
        row: number;
        spanCol: number; 
        spanRow: number; 
      };
}
