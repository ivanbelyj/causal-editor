import { Command } from "./command";

export class DragNodesCommand extends Command {
  constructor(dragAndDropManager, posDataAfterDrag, posDataBeforeDrag) {
    super(
      dragAndDropManager.setPosByPosData.bind(
        dragAndDropManager,
        posDataAfterDrag
      ),
      dragAndDropManager.setPosByPosData.bind(
        dragAndDropManager,
        posDataBeforeDrag
      )
    );
    this.posDataAfterDrag = posDataAfterDrag;
    this.posDataBeforeDrag = posDataBeforeDrag;
  }
}
