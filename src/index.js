import React, { useRef, useEffect, useState } from "react";
import { Text } from "react-native";

const wait = async (ms) => await new Promise(resolve => setTimeout(resolve, ms));
const getOverlap = (start, [...end]) => [...start, NaN].findIndex((char, i) => end[i] !== char);

async function type(ref, args) {
	for (const arg of args) {
		switch (typeof arg) {
			case "string":
				await edit(ref, arg);
				break;
			case "number":
				await wait(arg);
				break;
			case "function":
				await arg(ref, ...args);
				break;
			default:
				await arg;
		}
	}
}

async function edit(ref, text) {
	const overlap = getOverlap(ref.current.text, text);
	await perform(ref, [...deleter(ref.current.text, overlap), ...writer(text, overlap)]);
}

async function perform(ref, edits, speed = 60) {
	for (const op of editor(edits)) {
		op(ref);
		await wait(speed + speed * (Math.random() - 0.5));
	}
}

function* editor(edits) {
	for (const edit of edits) {
		yield (ref) =>
			requestAnimationFrame(() => {
				ref.current.text = edit;
				ref.current.setText(edit);
			});
	}
}

function* writer([...text], startIndex = 0, endIndex = text.length) {
	while (startIndex < endIndex) {
		yield text.slice(0, ++startIndex).join("");
	}
}

function* deleter([...text], startIndex = 0, endIndex = text.length) {
	while (endIndex > startIndex) {
		yield text.slice(0, --endIndex).join("");
	}
}

const initSteps = ["This", 500, "is", 500, "react-native-typical", 1000];
const TypingText = ({ steps = initSteps, loop, style = { fontSize: 14 } }) => {
	const [text, setText] = useState("");
	const textRef = useRef({ text, setText });

	useEffect(() => {
		if (loop === Infinity) type(textRef, steps.concat(type));
		if (typeof loop === "number") type(textRef, Array(loop).fill(steps).flat());
		else type(textRef, steps);
	}, []);

	return <Text style={style}>{text}</Text>;
};

export default TypingText;
