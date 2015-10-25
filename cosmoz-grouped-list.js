/*global cz, document, Polymer, window, d3, nv */
(function () {

	"use strict";

	Polymer({
		is: 'cosmoz-grouped-list',
		properties: {
			data: {
				type: Array,
				value: function () {
					return [];
				}
				// observer: '_dataChanged'
			},
			foldedGroups: {
				type: Array,
				value: function () {
					return [];
				}
			},
			flatData: {
				type: Array,
				computed: '_flattenData(data)',
				notify: true
			}
		},
		_changeIndex: 0,
		_flattenData: function (data) {
			if (!data) {
				return;
			}

			if (!(data instanceof Array) || !(data[0] instanceof Object)) {
				return;
			}

			var fData = [];

			data.forEach(function (group) {
				if (group.items) {
					fData = fData.concat(group, group.items);
				} else {
					fData = fData.concat(group);
				}
			});

			return fData;
		},
		foldGroup: function (group) {
			if (this.isFolded(group)) {
				return;
			}
			this.push('foldedGroups', group);
			this.notify(group);
			this.updateSizes(group);
		},
		getFoldIcon: function (item, foldedGroups) {
			if (this.isFolded(item.value)) {
				return 'expand-more';
			}
			return 'expand-less';
		},
		getGroup: function (item) {
			var foundGroup;
			this.data.some(function (group) {
				var found = group.items.indexOf(item) > -1;
				if (found) {
					foundGroup = group;
				}
				return found;
			});
			return foundGroup;
		},
		isFolded: function (group) {
			return this.foldedGroups.indexOf(group) > -1;
		},
		isGroup: function (item) {
			return this.data.indexOf(item) > -1;
		},
		isVisibleItem: function (itemNotify, foldedGroups) {
			var
				group,
				item = itemNotify.value;
			if (this.isGroup(item)) {
				return false;
			}
			group = this.getGroup(item);
			return !this.isFolded(group);
		},
		getTemplateInstance: function (itemNotify) {
			var item = itemNotify.value;

			if (this.isGroup(item)) {
				return this.$.groupTemplate.instantiateTemplate(item);
			}
			if (this.isVisibleItem(itemNotify)) {
				return Polymer.dom(this).querySelector('item-template').instantiateTemplate(item);
			}
		},
		notify: function (item) {
			var flatIndex = this.flatData.indexOf(item),
				notifyPath = 'flatData.' + flatIndex + '.__change' + this._changeIndex;
			this.notifyPath(notifyPath, this.flatData[flatIndex]);
			this._changeIndex += 1; // maintain uniqueness
		},
		toggleFold: function (event, detail, sender) {
			var
				item = event.model.__data__.item,
				group = this.isGroup(item) ? item : this.getGroup(item),
				isFolded = this.isFolded(group);

			if (isFolded) {
				this.unfoldGroup(group);
			} else {
				this.foldGroup(group);
			}
		},
		unfoldGroup: function (group) {
			if (!this.isFolded(group)) {
				return;
			}
			this.splice('foldedGroups', this.foldedGroups.indexOf(group), 1);
			this.notify(group);
			this.updateSizes(group);
		},
		updateSizes: function (group) {
			var list = this.$.list,
				that = this;
			group.items.forEach(function (item) {
				that.notify(item);
				list.updateSizeForItem(item);
			});
		}
	});
}());