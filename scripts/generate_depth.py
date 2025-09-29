import pathlib

import cv2
import numpy as np
import torch

MODEL_REPO = "intel-isl/MiDaS"
MODEL_NAME = "DPT_Small"


def load_image(path: pathlib.Path) -> np.ndarray:
    image = cv2.imread(str(path))
    if image is None:
        raise FileNotFoundError(f"Could not load image: {path}")
    return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)


def save_depth(depth: np.ndarray, template: np.ndarray, output_path: pathlib.Path) -> None:
    depth = depth - depth.min()
    if depth.max() > 0:
        depth = depth / depth.max()
    depth = (depth * 255.0).astype(np.uint8)
    depth_resized = cv2.resize(depth, (template.shape[1], template.shape[0]), interpolation=cv2.INTER_CUBIC)
    depth_resized = cv2.cvtColor(depth_resized, cv2.COLOR_GRAY2RGB)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(output_path), depth_resized)


def run() -> None:
    root = pathlib.Path(__file__).resolve().parents[1]
    image_path = root / "public" / "hero" / "montanas.jpg"
    output_path = root / "public" / "hero" / "montanas-depth.png"

    image = load_image(image_path)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model_type = MODEL_NAME
    model = torch.hub.load(MODEL_REPO, model_type)
    model.to(device)
    model.eval()

    transforms = torch.hub.load(MODEL_REPO, "transforms")
    transform = transforms.small_transform

    input_batch = transform(image).to(device)

    with torch.no_grad():
        prediction = model(input_batch)
        prediction = torch.nn.functional.interpolate(
            prediction.unsqueeze(1),
            size=image.shape[:2],
            mode="bicubic",
            align_corners=False,
        ).squeeze()

    depth_map = prediction.cpu().numpy()
    save_depth(depth_map, image, output_path)


if __name__ == "__main__":
    run()
