
function getMousePos(canvas, e) {
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    console.log("x: " + x + " y: " + y)
    return {x: x, y: y};
}

function drawPoint(canvas, ctx, e) {
    let { x, y } = getMousePos(canvas, e);
    let r = 3;
    ctx.fillRect(x - r/2, y - r/2, r, r);
}


function main() {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    canvas.addEventListener('mousedown', function(e) {
        drawPoint(canvas, ctx, e);
    });

}

main();