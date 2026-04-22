Component({
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    title: {
      type: String,
      value: '游戏结算'
    },
    score: {
      type: Number,
      value: 0
    },
    stars: {
      type: Number,
      value: 0
    },
    comment: {
      type: String,
      value: ''
    },
    fragment: {
      type: String,
      value: ''
    },
    showRetry: {
      type: Boolean,
      value: false
    }
  },
  methods: {
    onNext() {
      this.triggerEvent('next');
    },
    onRetry() {
      this.triggerEvent('retry');
    }
  }
})
