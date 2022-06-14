let images = [
    { url: "url 1", filename: "filename1" },
    { url: "url 2", filename: "filename2" },
    { url: "url 3", filename: "filename3" },
    { url: "url 4", filename: "filename4" },
];
const deleteImages = ["filename2", "filename3", "filename5"];
console.log("images:", images);
if (deleteImages) {
    deleteImages.forEach(filename => {
        const index = images.findIndex(image => image.filename === filename);
        (index >= 0) && (images.splice(index, 1));
    });
};
console.log("images:", images);


