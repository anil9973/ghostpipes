export function handlePushMessage(event) {
	/**@type {{deviceName: String,ipAddress:String,message:String}}*/
	const msgData = event["data"].json();
	const message = msgData.message;
	console.log(message);

	// pipelineId
}
