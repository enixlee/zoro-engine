/**
 * Auth: lijiang
 * Date: 2018/2/28
 * Description: PageLifeCycle
 */
export default {
  beforeCreate: function () {
    this.name = this.$vnode.tag;
    this.uuid = this.getEngine().$idGenerator.generateId('vue_component');
  },

  created: function () {
    this.eventsOn();
    if (this.getEngine().$dataLoader.isLoadComplete()) {
      this.dataInit();
    } else {
      this.getEngine().$bus.on(this.getEngine().$constants.events.EVENT_DATA_LOAD_COMPLETE, this, this.dataInit);
    }
  },

  beforeMount: function () {
  },

  mounted: function () {
  },

  beforeUpdate: function () {
  },

  updated: function () {
  },

  beforeDestroy: function () {
    this.eventsOff();
  },

  destroyed: function () {
  },

  methods: {
    eventsOn () {
      let bus = this.getEngine().$bus;
      let subjects = this.subjects();
      this.getEngine().$lodash.map(subjects, (v, k) => {
        if (!bus.hasEvent(k, this)) {
          bus.on(k, this, v);
        }
      });
    },
    modelEventsOff () {
      if (this.model && this.getEngine().$lodash.isFunction(this.model.subjects)) {
        let subjects = this.model.subjects();
        this.getEngine().$lodash.map(subjects, (v, k) => {
          this.getEngine().$bus.off(k, this.model, v);
        });
      }
    },
    eventsOff () {
      let subjects = this.subjects();
      this.getEngine().$lodash.map(subjects, (v, k) => {
        this.getEngine().$bus.off(k, this, v);
      });
      this.modelEventsOff();
      let event = this.getEngine().$constants.events.EVENT_DATA_LOAD_COMPLETE;
      if (this.getEngine().$bus.hasEvent(event, this)) {
        this.getEngine().$bus.off(event, this, this.dataInit);
      }
    },
    dataInit () {
    },
    subjects () {
    }
  }
};
