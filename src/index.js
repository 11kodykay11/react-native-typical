import React, { useRef, useEffect, useState } from "react";
import { Text } from "react-native";

const wait = async (ms) =>
	await new Promise((resolve) => setTimeout(resolve, ms));
const getOverlap = (start, [...end]) =>
	[...start, NaN].findIndex((char, i) => end[i] !== char);

function typePromise() {
	let stop = false;
	async function internal(ref, args) {
		for (const arg of args) {
			if (stop) return;
			switch (typeof arg) {
				case "string":
					await edit(ref, arg);
					break;
				case "number":
					await wait(arg);
					break;
				case "function":
					await arg(ref, args);
					break;
				default:
					await arg;
			}
		}
	}

	return { run: internal, cancel: () => (stop = true) };
}

async function edit(ref, text) {
	if (!ref || !ref.current) return;
	const overlap = getOverlap(ref.current.text || "", text);
	await perform(
		ref,
		[...deleter(ref.current.text || "", overlap)],
		ref.current.deleteDelay
	);
	await perform(ref, [...writer(text, overlap)], ref.current.editDelay);
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
				if (!ref || !ref.current) return;
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

function arrayEquals(a, b) {
	return (
		Array.isArray(a) &&
		Array.isArray(b) &&
		a.length === b.length &&
		a.every((val, index) => val === b[index])
	);
}

const initSteps = [
	"This",
	500,
	"is",
	500,
	"react-native-typical",
	1000,
	() => {},
];
const TypingText = ({
	loop = false,
	steps = initSteps,
	style = { fontSize: 14 },
	blinkChar = "|",
	blinkCursor = true,
	editDelay = 60,
	deleteDelay = 60,
}) => {
	const [text, setText] = useState("");
	const [blinker, setBlinker] = useState(blinkCursor);
	const textRef = useRef({ text, setText, editDelay, deleteDelay });
	const [curSteps, setCurSteps] = useState(steps || initialSteps);
	const typeRef = useRef({
		cancel: undefined,
		run: undefined,
	});

	useEffect(() => {
		if (!arrayEquals(steps, curSteps)) {
			typeRef?.current?.cancel && typeRef?.current?.cancel();
			setCurSteps(steps);
		}
	}, [steps]);

	// This creates blinking effect
	useEffect(() => {
		let id = 0;
		if (blinkCursor) {
			setBlinker(true);
			id = setInterval(() => setBlinker((p) => !p), 500);
		}
		return () => clearInterval(id);
	}, [text]);

	useEffect(() => {
		if (loop === Infinity) {
			type(textRef, curSteps.concat(type));
		} else if (typeof loop === "number") {
			type(textRef, Array(loop).fill(curSteps).flat());
		} else {
			typeRef.current = typePromise();
			typeRef.current.run(textRef, curSteps);
		}
	}, [curSteps]);

	// This is to keep cleanup out of the above loop.
	// Any new steps will reset the ref if placed above
	useEffect(() => () => (textRef.current = null), []);

	return (
		<Text style={style}>
			{text}
			{(blinker && blinkChar) || ` `}
		</Text>
	);
};

export default TypingText;
