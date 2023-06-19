import { Plugin } from "obsidian";
import { Configuration, OpenAIApi } from "openai";
import MetaMindSettings, { loadPluginSettings } from "./settings";
import { MetaMindSettingTab } from "./settings/plugin-tab";

export default class MetaMindPlugin extends Plugin {
	settings: MetaMindSettings;
	openAI: OpenAIApi;

	async onload() {
		this.settings = await loadPluginSettings(this);
		this.initialiseOpenAI();
		this.addSettingTab(new MetaMindSettingTab(this.app, this));
	}

	onunload() {}

	async saveSettings() {
		this.initialiseOpenAI();
		await this.saveData(this.settings);
	}

	initialiseOpenAI() {
		const configuration = new Configuration({
			// organization: "YOUR_ORG_ID",
			apiKey: this.settings.apiKey,
		});
		this.openAI = new OpenAIApi(configuration);
	}
}
