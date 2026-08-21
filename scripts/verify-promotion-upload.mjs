import { appRouter } from "../server/routers.ts";

const onePixelPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL6swAAAABJRU5ErkJggg==";

const caller = appRouter.createCaller({
  user: { id: 1, role: "admin" },
  req: {},
  res: {},
});

const result = await caller.promotions.uploadImages({ images: [{ dataUrl: onePixelPng }] });
console.log(JSON.stringify({ uploaded: result.images.length, url: result.images[0]?.url }));
