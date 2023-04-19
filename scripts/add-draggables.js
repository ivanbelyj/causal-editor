function addDraggables() {
    // const position = { x: 0, y: 0 }
    const nodeIdsAndPositions = new Map();

    interact(".draggable").draggable({
        origin: "self",
        inertia: true,
      listeners: {
        start (event) {
            if (nodeIdsAndPositions.has())
          console.log(event.type, event.target)
        },
        move (event) {
          position.x += event.dx
          position.y += event.dy
    
          event.target.style.transform =
            `translate(${position.x}px, ${position.y}px)`
        },
      }
    })
}
