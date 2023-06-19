import { Plugin } from "obsidian";

export default interface MetaMindSettings {
	apiKey: string;
	defaultModel: string;
}

export const DEFAULT_SETTINGS: MetaMindSettings = {
	apiKey: "",
	defaultModel: "",
};

export const loadPluginSettings = async (
	plugin: Plugin
): Promise<MetaMindSettings> => {
	return Object.assign({}, DEFAULT_SETTINGS, await plugin.loadData());
};
