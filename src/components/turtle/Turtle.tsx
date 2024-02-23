import React, { useContext, useEffect, useRef, useState } from 'react';
import CanvasContext from '../CanvasContext';
import { turtleCommandPubSub, useSubscriber } from '../../pubsub/pubsubs';
import { TurtleCommandMessage } from '../../pubsub/types';
import TurtleInstance from '../../models/TurtleInstance';

interface TurtleProps {
	name: string;
	// Additional properties for position, orientation, etc., can be added here
}

const Turtle: React.FC<TurtleProps> = ({ name }) => {
	const context = useContext(CanvasContext);
	/*
	These hooks (useRef, useState, useEffect, useSubscriber) must be in a separate hook, this is a very complex logic
	*/
	const turtleInstance = useRef<TurtleInstance>();
	const [dummy, setDummy] = useState(0);
	useEffect(() => {
		if (turtleInstance.current === null || turtleInstance.current === undefined) {
			turtleInstance.current = new TurtleInstance("turtle0", "turtles", {x: 400, y: 400}, 0, context, "down", "black", 1);
		} else {
			turtleInstance.current.setCanvasContext(context);
		}
	}, [context]);
	// TODO This is a complex logic, it must be in a separate hook
	useSubscriber<TurtleCommandMessage>(turtleCommandPubSub, (message) => {
		const instance = turtleInstance.current;
		console.log("Message received: ", message, instance);
		switch (message.command) {
			case "forward": instance?.go(message.distance); break;
			case "backward": instance?.go(-message.distance); break;
			case "left": instance?.rotate(message.radian); break;
			case "right": instance?.rotate(-message.radian); break;
		}
		setDummy((d) => d+1);
	}, [turtleInstance.current]);

	return <div style={{"position": "absolute", "top": turtleInstance.current?.position.y, "left": turtleInstance.current?.position.x }}>teknős</div>; // This component does not render any JSX itself
};

export default Turtle;
