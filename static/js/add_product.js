const imageInput = document.getElementById("imageInput");
const previewContainer = document.getElementById("preview-container");

imageInput.addEventListener("change", function () {
    previewContainer.innerHTML = ""; // Clear existing previews

    if (this.files && this.files.length > 0) {
        Array.from(this.files).forEach((file, index) => {
            const reader = new FileReader();

            reader.onload = function(e) {
                const imgWrapper = document.createElement("div");
                imgWrapper.style.position = "relative";
                imgWrapper.style.width = "100px";
                imgWrapper.style.height = "100px";
                imgWrapper.style.borderRadius = "10px";
                imgWrapper.style.overflow = "hidden";
                imgWrapper.style.boxShadow = "0 4px 10px rgba(0,0,0,0.15)";
                imgWrapper.style.border = "2px solid #38bdf8";

                const img = document.createElement("img");
                img.src = e.target.result;
                img.style.width = "100%";
                img.style.height = "100%";
                img.style.objectFit = "cover";

                const badge = document.createElement("span");
                badge.textContent = index === 0 ? "Main" : `Img ${index + 1}`;
                badge.style.position = "absolute";
                badge.style.bottom = "5px";
                badge.style.left = "5px";
                badge.style.background = index === 0 ? "#10b981" : "#1e293b";
                badge.style.color = "white";
                badge.style.fontSize = "10px";
                badge.style.padding = "2px 6px";
                badge.style.borderRadius = "4px";
                badge.style.fontWeight = "bold";

                imgWrapper.appendChild(img);
                imgWrapper.appendChild(badge);
                previewContainer.appendChild(imgWrapper);
            }

            reader.readAsDataURL(file);
        });
    }
});