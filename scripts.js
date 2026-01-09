function stabilizeOverlay() {
    if (!window.visualViewport || UI_STATE.overlayStack.length === 0) return;

    const vv = window.visualViewport;
    const activeId = UI_STATE.overlayStack[UI_STATE.overlayStack.length - 1];
    const overlay = document.getElementById(activeId);

    if (overlay) {
        // Instead of shrinking the height, we just shift the 'top' 
        // to match where the user is actually looking.
        overlay.style.top = `${vv.offsetTop}px`;
        
        // We keep the height at the full visible height to ensure 
        // it always reaches the keyboard edge.
        overlay.style.height = `${vv.height}px`;
    }
}

window.visualViewport.addEventListener('scroll', stabilizeOverlay);
window.visualViewport.addEventListener('resize', stabilizeOverlay);
