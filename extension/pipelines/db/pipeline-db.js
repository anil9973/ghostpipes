import { Pipe } from "../models/Pipe.js";
import { Pipeline } from "../models/Pipeline.js";
import { PipeNode } from "../models/PipeNode.js";
import { db, Store } from "./db.js";

/** @param {PipeNode} pipeNode, @param {string} pipelineId */
async function savePipeNode(pipeNode, pipelineId = globalThis.pipelineId) {
	return new Promise((resolve, reject) => {
		db.getObjStore(Store.Pipelines, "readwrite").then((store) => {
			const request = store.get(pipelineId);
			request.onsuccess = (evt) => {
				/**@type {Pipeline} */
				const pipeline = evt.target["result"];
				if (!pipeline) reject(`Pipeline with ID ${pipelineId} not found`);
				console.log(pipeNode);
				pipeline.nodes.push(pipeNode);

				const insertTask = store.put(pipeline);
				insertTask.onsuccess = (e) => resolve(e);
				insertTask.onerror = (e) => reject(e);
			};
			request.onerror = (e) => reject(e);
		});
	});
}

/** @param {Pipe} pipe, @param {string} pipelineId */
async function savePipe(pipe, pipelineId = globalThis.pipelineId) {
	return new Promise((resolve, reject) => {
		db.getObjStore(Store.Pipelines, "readwrite").then((store) => {
			const request = store.get(pipelineId);
			request.onsuccess = (evt) => {
				/**@type {Pipeline} */
				const pipeline = evt.target["result"];
				if (!pipeline) reject(`Pipeline with ID ${pipelineId} not found`);
				pipeline.pipes.push(pipe);

				const insertTask = store.put(pipeline);
				insertTask.onsuccess = (e) => resolve(e);
				insertTask.onerror = (e) => reject(e);
			};
			request.onerror = (e) => reject(e);
		});
	});
}

/** @param {PipeNode[]} pipeNodes, @param {Pipe[]} pipes, @param {string} pipelineId */
async function insertPipeNodes(pipeNodes, pipes, pipelineId = globalThis.pipelineId) {
	return new Promise((resolve, reject) => {
		db.getObjStore(Store.Pipelines, "readwrite").then((store) => {
			const request = store.get(pipelineId);
			request.onsuccess = (evt) => {
				/**@type {Pipeline} */
				const pipeline = evt.target["result"];
				if (!pipeline) reject(`Pipeline with ID ${pipelineId} not found`);
				pipeline.nodes.push(...pipeNodes);
				pipeline.pipes.push(...pipes);

				const insertTask = store.put(pipeline);
				insertTask.onsuccess = (e) => resolve(e);
				insertTask.onerror = (e) => reject(e);
			};
			request.onerror = (e) => reject(e);
		});
	});
}

/**@param {Object} config, @param {string} pipeNodeId */
async function updateNodeConfig(pipeNodeId, config, summary, pipelineId = globalThis.pipelineId) {
	pipelineId ||= new URLSearchParams().get("p");
	if (!pipelineId) throw new Error("pipelineId not provided");

	return new Promise((resolve, reject) => {
		db.getObjStore(Store.Pipelines, "readwrite").then((store) => {
			const request = store.get(pipelineId);
			request.onsuccess = (evt) => {
				/**@type {Pipeline} */
				const pipeline = evt.target["result"];
				if (!pipeline) reject(`Pipeline with ID ${pipelineId} not found`);
				const pipeNode = pipeline.nodes.find((node) => node.id === pipeNodeId);
				if (!pipeNode) reject(`pipeNode with ID ${pipeNode} not found`);
				pipeNode.summary = summary;
				pipeNode.config = config;
				const insertTask = store.put(pipeline);
				insertTask.onsuccess = (e) => resolve(e);
				insertTask.onerror = (e) => reject(e);
			};
			request.onerror = (e) => reject(e);
		});
	});
}

/** @param {string} pipeNodeId, @param {string} pipelineId */
async function removePipeNode(pipeNodeId, pipelineId = globalThis.pipelineId) {
	return new Promise((resolve, reject) => {
		db.getObjStore(Store.Pipelines, "readwrite").then((store) => {
			const request = store.get(pipelineId);
			request.onsuccess = (evt) => {
				/**@type {Pipeline} */
				const pipeline = evt.target["result"];
				if (!pipeline) reject(`Pipeline with ID ${pipelineId} not found`);
				const index = pipeline.nodes.findIndex((node) => node.id === pipeNodeId);
				if (index === -1) return resolve();
				pipeline.nodes.splice(index, 1);

				const insertTask = store.put(pipeline);
				insertTask.onsuccess = (e) => resolve(e);
				insertTask.onerror = (e) => reject(e);
			};
			request.onerror = (e) => reject(e);
		});
	});
}

export const pipedb = { updateNodeConfig, savePipeNode, savePipe, insertPipeNodes, removePipeNode };
