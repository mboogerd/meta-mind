import {
	App,
	DropdownComponent,
	Notice,
	PluginSettingTab,
	Setting,
} from "obsidian";
import type MetaMindPlugin from "../main";
import { Model } from "openai";

export class MetaMindSettingTab extends PluginSettingTab {
	plugin: MetaMindPlugin;
	models: Model[];
	modelDropdown: DropdownComponent;

	constructor(app: App, plugin: MetaMindPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	async display(): Promise<void> {
		const { containerEl } = this;
		containerEl.empty();

		this.addApiSetting(containerEl);
		this.addApiDependentSettings(containerEl, true);

		await this.initialiseApiDependentData();
	}

	addApiSetting(containerEl: HTMLElement) {
		// Adjusted from Hyeonseo Nam's Auto-Classifier Obisidian plugin.
		// https://github.com/HyeonseoNam/auto-classifier

		containerEl.createEl("h1", { text: "API Setting" });
		const apiKeySetting = new Setting(containerEl)
			.setName("OpenAI API Key")
			.setDesc("")
			.addText((text) =>
				text
					.setPlaceholder("API key")
					.setValue(this.plugin.settings.apiKey)
					.onChange(async (value) => {
						// save data
						this.plugin.settings.apiKey = value;
						await this.plugin.saveSettings();

						if (await this.initialiseApiDependentData()) {
							apiValidateMessageEl.setText(
								"Successfully initialised OpenAI client"
							);
							apiValidateMessageEl.style.color =
								"var(--text-success)";
						} else {
							apiValidateMessageEl.setText(
								"Failed to use key in OpenAI client"
							);
							apiValidateMessageEl.style.color =
								"var(--text-error)";
						}
					})
			);
		// API Key Description & Message
		apiKeySetting.descEl.createSpan({
			text: "Enter your OpenAP API key. If you don't have one yet, or want to renew it, you can create one ",
		});
		apiKeySetting.descEl.createEl("a", {
			href: "https://platform.openai.com/account/api-keys",
			text: "here",
		});
		const apiValidateMessageEl = document.createElement("div");
		apiKeySetting.descEl.appendChild(apiValidateMessageEl);
	}

	async initialiseApiDependentData(): Promise<boolean> {
		const response = await this.plugin.openAI.listModels();

		if (response.status < 200 || response.status >= 300) {
			new Notice(
				`[Meta Mind] Failed to retrieve OpenAI models.\nResponse status code = ${response.status}`
			);
			return false;
		}

		this.models = response.data.data;

		const options = this.models
			.map((m) => ({ [m.id]: m.id }))
			.reduce((acc, cur) => ({ ...acc, ...cur }), {});
		this.modelDropdown
			.setDisabled(false)
			.addOptions(options)
			.setValue(this.plugin.settings.defaultModel);

		return this.models.length > 0;
	}

	addApiDependentSettings(containerEl: HTMLElement, disable: boolean) {
		new Setting(containerEl)
			.setName("Default Model")
			.setDesc("Choose the default model to employ")
			.addDropdown(async (dropdown) => {
				dropdown.setDisabled(disable);
				dropdown.onChange(async (key) => {
					this.plugin.settings.defaultModel = key;
					await this.plugin.saveSettings();
				});
				this.modelDropdown = dropdown;
			});
	}
}
