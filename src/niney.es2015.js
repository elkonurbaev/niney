const boundsModel = new BoundsModel();
boundsModel.setBounds(new Bounds(window.innerWidth, window.innerHeight));
window.addEventListener("resize", function(resizeEvent) {
    boundsModel.setBounds(new Bounds(window.innerWidth, window.innerHeight));
});

export const windowBoundsModel = boundsModel;
export const defaultBoundsModel = new BoundsModel();

export const defaultFocusModel = new FocusModel();
export const defaultEnvelopeModel = new EnvelopeModel(defaultBoundsModel, defaultFocusModel);

export const defaultTilesLayer = new Layer("Tiles");

