# Software Requirements

## 1. Users

- This software should run in a browser
- Users should have a mouse and keyboard and run on a desktop computer with minimum 1920x1080 display
- The computer should be at least a recent Macbook or equivalent.
- The software should be intuitive and include an instructions page of how to use it

## 2. Features


- The software should include a default model with a character with no textures
- The software should allow the user to use their mouse to paint on the model in the browser
- The software should have configurable "brushes" for how the vertices are painted
- The software should have a palette of standard materials to choose from, which can be configured with sliders
- The software should have several display options, so you can see an individual material, or all at once
- The software should allow users to display each material as a high-visibility color for testing purposes



## 3. Technical Stack

- The software should be able to load in standard 3D files in GLTF
- The software should be able to export the file as a packaged GLTF or USD file
- The files exported should interoperate with Apple's Reality Composer Pro package
- The software should use a minimum of frameworks or complex tooling
- The software should use THREEjs for the viewport
- The software should not use WebAssembly except for import/export duties, and if absolutely necessary
- The software should utilize a UI library like ImGUI, but something that's appropriate for the web/THREEjs

## 4. Branding

- Call it BUCK Painter
- Give it a splash screen with the BUCK logo in the folder `buck-logo-black-tight.png`