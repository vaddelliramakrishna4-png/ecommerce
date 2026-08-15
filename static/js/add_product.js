(function() {
    function setupSlotPreview(inputId, previewId) {
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);

        if (input && preview) {
            input.addEventListener("change", function () {
                const file = this.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        preview.src = e.target.result;
                        preview.style.display = "block";
                        // Update wrapper border to indicate selection success
                        input.parentElement.style.border = "2px solid #10b981";
                    }
                    reader.readAsDataURL(file);
                } else {
                    preview.src = "";
                    preview.style.display = "none";
                    // Reset to original border
                    input.parentElement.style.border = inputId === "imageInput1" ? "2px dashed #38bdf8" : "2px dashed #475569";
                }
            });
        }
    }

    setupSlotPreview("imageInput1", "preview1");
    setupSlotPreview("imageInput2", "preview2");
    setupSlotPreview("imageInput3", "preview3");
    setupSlotPreview("imageInput4", "preview4");
})();