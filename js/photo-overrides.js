// Hand-picked "lead" photos per litter, identified by visual review.
// momPhoto: a clear shot of the mom cat, shown first in the cover thumbnails.
// coverOrder: if set, fully overrides the automatic cover-thumbnail ordering
// (used when the default chronological/mom/collage picks aren't right, e.g.
// to skip photos with people or a mismatched cat in them).
const PHOTO_OVERRIDES = {
  "penelope-calypso-onyx-terry-beans": { momPhoto: "2026-04-12_IMG_0861.jpeg" },
  "joyce-litter": { momPhoto: "2026-02-16_IMG_9622.jpeg" },
  "stella-litter": { momPhoto: "2025-07-10_PXL_20250710_163652830.jpeg" },
  "churro-litter": { momPhoto: "2025-04-13_IMG_3548.jpeg" },
  "professor-inkling-litter": {
    momPhoto: "2024-08-27_IMG_9578.jpeg",
    coverOrder: [
      "2024-08-27_IMG_9578.jpeg",
      "2024-09-04_IMG_9835.jpeg",
    ],
  },
  "titan-poseidon": {
    momPhoto: "2023-12-23_IMG_5255.jpeg",
    coverOrder: [
      "2023-12-23_IMG_5255.jpeg",
      "2024-01-09_IMG_5497.jpeg",
    ],
  },
  "april-raf-michael-lea-dona": {
    momPhoto: "user-added_april-mom-standing.jpeg",
    coverOrder: [
      "user-added_april-mom-standing.jpeg",
      "2024-07-01_IMG_8567.jpeg",
      "2024-06-25_IMG_8443.jpeg",
    ],
  },
  "sparrow": {
    coverOrder: [
      "2023-11-18_IMG_4875.jpeg",
      "2023-11-22_IMG_4961.jpeg",
      "2023-11-23_IMG_4973.jpeg",
    ],
  },
  "pascal-lovelace-euler-fibonacci": {
    coverOrder: [
      "2026-05-11_IMG_1603.jpeg",
      "2026-05-12_IMG_1605.jpeg",
      "2026-05-16_IMG_1733.jpeg",
    ],
  },
  "hazel-aspen-ash-oak": {
    coverOrder: [
      "2023-08-29_IMG_3784.jpeg",
    ],
  },
  "glimmer-shimmer": {
    coverOrder: [
      "2023-07-29_IMG_3302.jpeg",
      "2023-08-10_71337513451__EA07D697-3F62-4264-9D41-EDE3FF74ABC5.jpeg",
      "2023-08-01_IMG_3381.jpeg",
    ],
  },
  "kr-kittens-2026": {
    coverOrder: [
      "2026-10-13_IMG_4258.jpeg",
      "2026-10-15_IMG_4302.jpeg",
      "2026-10-16_IMG_4304.jpeg",
    ],
  },
  "cribbage-litter": {
    momPhoto: "2026-08-10_IMG_2900.jpeg",
    coverOrder: [
      "2026-08-10_IMG_2900.jpeg",
      "2026-08-08_IMG_2854.jpeg",
      "2026-09-18_IMG_3718.jpeg",
    ],
  },
  "md-kittens-2026": {
    coverOrder: [
      "2026-07-15_IMG_2632.jpeg",
      "2026-07-15_IMG_2636.jpeg",
      "2026-07-15_IMG_2640.jpeg",
    ],
  },
};
