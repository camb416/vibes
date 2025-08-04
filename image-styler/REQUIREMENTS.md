# Image Styler
- build an user-friendly UI for editing and selecting from awesome presets.
- the initial presets are in sample-styles folder
- generate me sixteen more in the synthetic-styles
- add a user-space place to enter an OpenAI key that saves locally, but never in code
- start with a default input image from unsplash, but allow user to drop another image in the browser
- use webpack or some livereload tooling
- create a node-based infinite canvas UI where you can drag and drop images onto it
- the nodes should be:
  - TEXT INPUT, where you type some stuff.
  - IMAGE, which has an input and output handle. on the node is a + dropdown, which can take a dropped file, select from computer, or "random image" (which will load a 512x512 image from unsplash).
    - if you add an image, the input handle disappears. If you connect something to the input handle, the output handle disappears
  - STYLE, which lets you select from presets. Requires IMAGE input
  - MY STYLE, that allows for custom structure, similar to the sample/generated styles.
  - MIX, which allows two inputs to be added into a single output, with a dial to adjust the mix between two items.
    - this type of node should be able to concat two inputs together, annotating them both with the percentage they should be included in the output prompt.
- ADD. This should just look like a nubbin with a plus on it, and be used to concat text prompts together with a space in between

  - Text input nodes should flow into Style, which will concatenate both items into a longer prompt that can go into an image input
  - two or more style inputs can be defined.

# Functional Requirements
- The node graph that the user creates must save locally so when the page refreshes, all the nodes, their positions, and their attributes, and any images in image nodes are preserved
- There should be an "add" UI that pops up if the user clicks anywhere on the canvas. This gives the dropdown of what node to add. It also appears if i link is drawn out from a node, and released on an empty part of the canvas. Press Esc or click off to dismiss it.
  - the add ui when summoned by dragging a link, should only list nodes that have inputs


# User Stories
- As a user:
  - I want to be able to export my current node graph, minus any images in it as a little package
  - I want to be able to import an exported nodegraph
  - I want to be able to hold Alt/Option and click and drag to copy a node, with all its current data copied.
  - I want to be able to mix and match text prompts and have them concat each other when i string two together into a style. Whichever one is higher in the Y axis should 

# Visual Design Language
  - Minimal, with small monospaced type, styled as small labels
  - Images should look like polaroids, with small white borders, larger on the bottom, where the UI should live.
  - Text Prompts should look like notebook pages
  - Styles should look like sticky notes, in yellow
  - Mix nodes should have a vertical slider, which can be adjusted the mix between two inputs. Make sure when manipulating this that the dragging of the node or scrolling of the node area is paused.
  - Use visual skeumorphic cues to differentiate the nodes, no titles by default.
  

