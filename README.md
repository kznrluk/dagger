# Dagger - A Caption Editor for Stable Diffusion

![image](https://github.com/kznrluk/dagger/assets/29700428/9bfaae0a-382b-4e9c-bfff-12c17ec4d878)

[日本語版READMEはこちら](https://github.com/kznrluk/dagger/blob/main/README-JA.md)

Dagger is an application that strongly supports the creation of comma-separated caption files commonly used in Stable Diffusion. You can use it through your web browser.

[Try it out](https://dagger.anyfrog.net)

It is designed to be simple yet powerful, enabling you to organize your dataset before LoRA training or FineTuning more efficiently.

## How to Use
Dagger treats an image file and its caption file with the same name as a pair.

### 0. Preparations
Dagger is compatible with the output files from WD14-Tagger. You can pre-tag your data if necessary.

https://github.com/toriato/stable-diffusion-webui-wd14-tagger

### 1. Importing Images

You can add files via drag and drop or by selecting the files you want to import from the folder icon in the upper left corner. Dagger will search for a text file with the same name as each selected image file (`.txt`, `.caption`) and treat them as a pair. Separate inputs are not allowed.

### 2. Tag Editing

Dagger provides several features to make editing convenient.

#### 2-1. Basic Functions

When you select an image, its details and tags will be displayed in the right pane. You can add or remove tags from here.

You can select multiple images using CTRL or SHIFT mode. When multiple images are selected, the right pane displays the common tags of all selected images.

You can use CTRL+A to select all images currently being filtered.

#### 2-2. Tag Filter

After importing images, all tags will be displayed in the FILTER BY TAGS at the bottom of the screen. You can filter images by selecting these tags. The number displayed next to each tag indicates how many images have that tag.

![image](https://github.com/kznrluk/dagger/assets/29700428/a59ab230-f3f7-4e8e-9423-2e7db87af1ba)

By clicking in normal mode, only images that **have** the selected tag(s) will be displayed.

When clicking in CTRL mode, only images that **do not have** the selected tag(s) will be displayed. If you click the delete button of a tag while in CTRL mode, that tag will be removed from all images.

![image](https://github.com/kznrluk/dagger/assets/29700428/90508290-c71b-4cc4-a600-55844c0bc956)

#### 2-3. Trimming

You can trim images. Pressing Save will overwrite the image with its trimmed version. Pressing Save as New will save a copy of the image.

![image](https://github.com/kznrluk/dagger/assets/29700428/b1ba3604-ca03-473c-95c7-76ca423163ca)

### 3. Saving as Zip

When you finish editing, save the edited images and caption files from the save icon in the upper left corner. If you click the save icon while having images selected, only those images will be saved. You can use `Ctrl+A` while applying a specific tag filter to output only the images subject to that filter. This feature is useful when you want to experiment with various learning variations.

## Contributions

Please use GitHub's Issue tracker for feature requests and bug reports. If you're in Japan, feel free to use Japanese.

Pull requests are also welcome. However, Dagger values simplicity. There's a chance we may not merge feature addition PRs, so please be aware of that. It's smoother if you issue beforehand.

## License

MIT
