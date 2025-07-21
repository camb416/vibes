# features

- Make a fullscreen isometric black-and-white grid in a large canvas or ThreeJS context.
- It should be performant with a lot of grid.
- The isometric should be similar to the perspective shear on Sim City 2000.
- Allow user to click and drag to raise or lower the terrain.
- scroll around
- zoom in/out
- randomize button that uses noise to intelligently make nice terrain
- Mouse clicks on the screen should line up with where the geo is loading, so use a raycast

# visual notes
- thick black lines on white
- make the landforms opaque, so the grid lines don't show through
- can be a little retro, like SNES graphics

# interactive notes
- make the scroll snappy and feel satisfying
- each click should move the terrain up/down in discrete chunks that look good.