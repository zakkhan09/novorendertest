import { API, Camera, createAPI, Scene } from "@novorender/webgl-api";
import * as dataJsApi from "@novorender/data-js-api";
import PositionButton from "./PositionButton";
const _api:any = createAPI
const api = _api({
  // Path to where the files previously copied from node_modules are hosted
  scriptBaseUrl: `${window.location.origin}/novorender/webgl-api/`,
});
const canvas = document.querySelector<HTMLCanvasElement>("#canvas")!;
main(api, canvas);

async function main(api: API, canvas: HTMLCanvasElement) {
  const dataApi = dataJsApi.createAPI({
    serviceUrl: "https://data.novorender.com/api",
  });
  const sceneData = await dataApi
  // Condos scene ID, but can be changed to any public scene ID
  .loadScene("3b5e65560dc4422da5c7c3f827b6a77c")
  .then((res) => {
    if ("error" in res) {
      throw res;
    } else {
      return res;
    }
  });

  const { url, db } = sceneData;
  const view = await api.createView(
    { background: { color: [0, 0, 0, 0] } }, // transparent
    canvas
  );

  view.camera.controller = api.createCameraController({ kind: "flight"},canvas);
  view.scene = await api.loadScene(url, db);

  const ctx = canvas.getContext("bitmaprenderer");
  for (let index = 0; index < 3; index++) {
    createButtons(view.camera)
  }
  let searching = false;
  //search form
    document.getElementById("search_form")?.addEventListener("submit", async (form_event) =>{
    const abortController = new AbortController()
    if(searching){
      abortController.abort();
      searching = false;
    }
    searching = true;
    form_event.preventDefault()
    if(view.scene){
    const element:any =document.getElementById('search-input');
    const iterator = view.scene.search({ searchPattern: element.value },abortController.signal);
    const result: number[] = [];
    if(iterator){
      for await (const object of iterator) {
        result.push(object.id);
      }
    }

      isolateObjects(view.scene, result);
      searching = false;
    }
    
    
  });
  // main render loop
  while (true) {
    // handle canvas resizes
    const { clientWidth, clientHeight } = canvas;
    view.applySettings({
      display: { width: clientWidth, height: clientHeight },
    });

    // render frame
    const output = await view.render();
    {
      // finalize output image
      const image = await output.getImage();
      if (image) {
        // display in canvas
        ctx?.transferFromImageBitmap(image);
        image.close();
      }
    }
  }
}

function createButtons(camera:Camera){
  const button = new PositionButton(camera)
  button.generateButton();
  return button;
}

function isolateObjects(scene: Scene, ids: number[]): void {
  if(ids.length == 0){
    scene.objectHighlighter.objectHighlightIndices.fill(0);
    scene.objectHighlighter.commit();
    return;
  }
  scene.objectHighlighter.objectHighlightIndices.fill(255);
  ids.forEach((id) => (scene.objectHighlighter.objectHighlightIndices[id] = 0));
  scene.objectHighlighter.commit();
}
