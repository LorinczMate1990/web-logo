import React, { useEffect, useRef, useState } from "react";
import CanvasStateStore from "../../utils/CanvasStateStore.js";
import config from "../../config.js";
import { useLocalFiles } from "../../context/LocalFileContext.js";
import { readBinaryFile, readFile } from "../../utils/FileHandling.js";

const TurtleImage: React.FC<{ path: string, canvasStateStore: CanvasStateStore }> = ({ path, canvasStateStore }) => {
	const [place, label] = path.split("://");
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const localFileRegistry = useLocalFiles();

	const memoryPicture = place === "memory" ? canvasStateStore.getState(label) : null;
	const [imageUrl, setImageUrl] = useState<string>("");

	useEffect(() => {
		if (place !== "memory" || !memoryPicture) return;

		const canvas = canvasRef.current;
		if (!canvas) return;

		canvas.width = memoryPicture.width;
		canvas.height = memoryPicture.height;

		const ctx = canvas.getContext('2d');
		if (ctx) {
			ctx.putImageData(memoryPicture, 0, 0);
		}
	}, [place, memoryPicture]);

	useEffect(() => {
		if (place !== "file") return;
		const handle = localFileRegistry[label] as FileSystemFileHandle;
		readBinaryFile(handle).then((content) => {
			const blob = new Blob([content]);
			setImageUrl(URL.createObjectURL(blob));
		});
	}, [place]);



	if (place === "file") {
		return (<img
			onDragStart={(e) => e.preventDefault()}
			draggable={false}
			src={imageUrl}
		/>)
	}

	if (place === "builtin") {
		const src = Object.entries(config.images).find(([imgPath]) =>
			imgPath.endsWith(`${label}.png`)
		)?.[1].default;

		return (
			<img
				onDragStart={(e) => e.preventDefault()}
				draggable={false}
				src={src}
			/>
		);
	}

	if (place === "memory" && memoryPicture) {
		return (
			<canvas
				ref={canvasRef}
				onDragStart={(e) => e.preventDefault()}
				draggable={false}
			/>
		);
	}

	return null;
};

export default TurtleImage;