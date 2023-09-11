import React, { useRef, useEffect, useState, MutableRefObject } from "react";
import { Text } from "react-native";

const wait = async (ms: number) =>
	await new Promise((resolve: any) => setTimeout(resolve, ms));
const getOverlap = (start: string, [...end]) =>
	[...start, NaN].findIndex((char, i) => end[i] !== char);

function typePromise() {
	let stop = false;
	async function internal(ref: MutableRefObject<TextRef>, args: Steps[]) {
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
		return args;
	}

	return { run: internal, cancel: () => (stop = true) };
}

async function type(ref: MutableRefObject<TextRef>, args: Steps[]) {
	for (const arg of args) {
		// kill execution if reset flag gets active
		if (ref.current.isReset) return;
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
	return args;
}

async function edit(ref: MutableRefObject<TextRef>, text: string) {
	if (!ref || !ref.current) return;
	const overlap = getOverlap(ref.current.text || "", text);
	await perform(
		ref,
		[...deleter(ref.current.text || "", overlap)],
		ref.current.deleteDelay,
		true
	);
	await perform(ref, [...writer(text, overlap)], ref.current.editDelay, false);
}

async function perform(
	ref: MutableRefObject<TextRef>,
	edits: any,
	speed = 60,
	isDelete = false
) {
	for (const op of editor(edits)) {
		if (!isDelete && ref.current.isReset) {
			continue;
		}
		op(ref);
		await wait(speed + speed * (Math.random() - 0.5));
	}
}

function* editor(edits: any) {
	for (const edit of edits) {
		yield (ref: MutableRefObject<TextRef>) =>
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

function arrayEquals(a: any[], b: any[]) {
	return (
		Array.isArray(a) &&
		Array.isArray(b) &&
		a.length === b.length &&
		a.every((val, index) => val === b[index])
	);
}

function maxStringLength(arr: any[]) {
	let maxLength = 0;
	arr.map((val) => {
		if (typeof val === "string") {
			maxLength = Math.max(maxLength, val.length);
		}
	});
	return maxLength;
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

type Steps =
	| string
	| number
	| (() => void)
	| ((ref: MutableRefObject<TextRef>, args: Steps[]) => void);

type TypingTextProps = {
	loop?: false | number;
	steps?: Steps[];
	style?: any;
	blinkChar?: string;
	blinkCursor?: boolean;
	editDelay?: number;
	deleteDelay?: number;
};

type TextRef = {
	text: string;
	setText: (value: string) => void;
	editDelay: number;
	deleteDelay: number;
	isReset: boolean;
};

const TypingText = ({
	loop = false,
	steps = initSteps,
	style = { fontSize: 14 },
	blinkChar = "|",
	blinkCursor = true,
	editDelay = 60,
	deleteDelay = 60,
}: TypingTextProps) => {
	const [text, setText] = useState("");
	const [blinker, setBlinker] = useState(blinkCursor);
	const textRef = useRef<TextRef>({
		text,
		setText,
		editDelay,
		deleteDelay,
		isReset: false,
	});
	const [curSteps, setCurSteps] = useState(steps || initSteps);

	useEffect(() => {
		if (!arrayEquals(steps, curSteps)) {
			textRef.current.isReset = true;
			// setTimeout will allow existing type function to exit
			setTimeout(() => {
				textRef.current.isReset = false;
				setCurSteps(steps);
			}, 500);
		}
	}, [steps, curSteps]);

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
		const _run = type;
		if (loop === Infinity) {
			_run(textRef, curSteps.concat(_run));
		} else if (typeof loop === "number") {
			_run(textRef, Array(loop).fill(curSteps).flat());
		} else {
			_run(textRef, curSteps);
		}
	}, [curSteps]);

	// This is to keep cleanup out of the above loop.
	// Any new steps will reset the ref if placed above
	// useEffect(() => () => (textRef.current = null), []);

	return (
		<Text style={style}>
			{text}
			{(blinker && blinkChar) || ` `}
		</Text>
	);
};

export default TypingText;
