import _ from 'lodash'
import * as d3 from 'd3'

export default class Dashboard {
  constructor(config) {
    const {
      id = this.requiredParam('id'),
        diameter = this.requiredParam('diameter'),
        innerDialPadding = '20',
        pointerBackgroundWidth = 40,
        pointerBackgroundPadding = 60,
        data: {
          value = 0,
          minValue = 0,
          maxValue = 300,
          fontSize = '6rem',
          pointerColor = 'rgba(249, 180, 60)',
          color = 'rgb(255, 255, 255)',
          className = 'dashboard-value-label'
        },
        unit: {
          text: unitText,
          fontSize: unitFontSize,
          color: unitColor
        },
        label: {
          className: labelClassName = 'dashboard-name-label',
          color: labelColor = 'rgba(71, 67, 127)',
          fontSize: labelFontSize = '3rem',
          offset: {
            x: labelOffsetX = 0,
            y: labelOffsetY = 0
          },
          text: labelText = '室内PM2.5'
        },
        rate: {
          className: rateClassName = 'dashboard-name-label',
          color: rateColor = 'rgba(255, 255, 255)',
          fontSize: rateFontSize = '3rem',
          offset: {
            x: rateOffsetX = 0,
            y: rateOffsetY = 0
          },
          text: rateText = '室内PM2.5',
          backgroundHeight: rateBackgroundHeight = '3rem',
          backgroundColor: rateBackgroundColor = '#4CBE83'
        },
        isDebugger = true
    } = config

    this.id = id
    this.diameter = this.getDashboardWidth(diameter)
    this.radius = this.diameter / 2
    this.innerDialPadding = innerDialPadding
    this.pointerBackgroundWidth = pointerBackgroundWidth
    this.pointerBackgroundPadding = pointerBackgroundPadding
    this.data = {
      value,
      minValue,
      maxValue,
      fontSize,
      pointerColor,
      color,
      className
    }
    this.unit = {
      text: unitText,
      fontSize: unitFontSize,
      color: unitColor
    }
    this.label = {
      className: labelClassName,
      color: labelColor,
      fontSize: labelFontSize,
      offset: {
        x: labelOffsetX,
        y: labelOffsetY
      },
      text: labelText
    }
    this.rate = {
      backgroundHeight: rateBackgroundHeight,
      backgroundColor: rateBackgroundColor,
      className: rateClassName,
      color: rateColor,
      fontSize: rateFontSize,
      offset: {
        x: rateOffsetX,
        y: rateOffsetY
      },
      text: rateText
    }

    this.isDebugger = isDebugger

    this.resize = this.resize.bind(this)
  }
  initialize() {
    this.renderIndexDial()
    window.addEventListener('resize', _.debounce(this.resize, 1000))
  }
  /** 绘制表盘 */
  renderIndexDial() {
    this.dashboardContainer = d3.select(`#${this.id}`)
    if (!this.canvas) {
      this.canvas = this.dashboardContainer.append('svg')
    }

    this.canvas.attr('width', this.diameter).attr('height', this.diameter)

    if (!this.group) {
      this.group = this.canvas.append('g')
    }

    this.group.attr('transform', `translate(${this.radius}, ${this.radius})`)

    let outerArc = d3.arc()
      .innerRadius(0)
      .outerRadius(this.radius)
      .startAngle(0)
      .endAngle(2 * Math.PI)

    /** 添加外表盘 */
    if (!this.outterDial) {
      this.outterDial = this.group.append('path')
    }
    this.outterDial.attr('d', outerArc()).attr('fill', 'rgb(93, 198, 142)')

    /** 添加内表盘 */
    let innerArc = d3.arc()
      .innerRadius(0)
      .outerRadius(this.radius - this.innerDialPadding)
      .startAngle(0)
      .endAngle(2 * Math.PI)
    if (!this.innerDial) {
      this.innerDial = this.group.append('path')
    }
    this.innerDial.attr('d', innerArc()).attr('fill', 'rgb(255, 255, 255)')

    /** 添加指针的表盘 */
    let connerRadius = this.pointerBackgroundWidth / 2
    let pointerBackgroundArc = d3.arc()
      .cornerRadius(connerRadius)
      .innerRadius(this.radius - (this.pointerBackgroundWidth + this.pointerBackgroundPadding))
      .outerRadius(this.radius - this.pointerBackgroundPadding)
      .startAngle(-0.75 * Math.PI)
      .endAngle(0.75 * Math.PI)
    if (!this.pointerBackground) {
      this.pointerBackground = this.group.append('path')
    }
    this.pointerBackground.attr('d', pointerBackgroundArc()).attr('fill', 'rgb(197, 197, 197)')

    this.setPointer()
    /** 设置value文字 */
    this.setValue(this.data.value)

    /** 设置label */
    this.setLabel()

    /** 设置rate */
    this.setRate()
  }
  setPointer() {
    let startAngle = -0.75 * Math.PI
    let endAngle = 0.75 * Math.PI
    let scale = d3.scaleLinear()
      .domain([this.data.minValue, this.data.maxValue])
      .range([startAngle, endAngle])
    let connerRadius = this.pointerBackgroundWidth / 2
    let pointerArc = d3.arc()
      .cornerRadius(connerRadius)
      .innerRadius(this.radius - (this.pointerBackgroundWidth + this.pointerBackgroundPadding))
      .outerRadius(this.radius - this.pointerBackgroundPadding)
      .startAngle(startAngle)
      .endAngle(scale(this.data.value))
    if (!this.pointerArcEl) {
      this.pointerArcEl = this.group.append('path').attr('fill', this.data.pointerColor)
    }
    // this.pointerArcEl.transition(1000).attr('d', pointerArc())
    this.pointerArcEl.attr('d', pointerArc())

    // 添加指针上的圆点
    let angle = scale(this.data.value)
    let circleStartAngle = angle - 0.16
    let circleEndAngle = angle + 0.16
    let innerRadius = this.radius - (this.pointerBackgroundWidth * 1.1 + this.pointerBackgroundPadding)
    let outerRadius = this.radius - this.pointerBackgroundPadding * 0.9
    let cornerRadius = outerRadius - innerRadius
    let pointerCircleArc = d3.arc()
      .cornerRadius(cornerRadius)
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(circleStartAngle)
      .endAngle(circleEndAngle)
    if (!this.pointerCircleArcEl) {
      this.pointerCircleArcEl = this.group.append('path').attr('fill', '#e7e7e7')
    }
    this.pointerCircleArcEl.attr('d', pointerCircleArc())
  }
  setValue(value) {
    if (value) {
      this.data.value = value
      this.setPointer()
      if (!this.valueEl) {
        this.valueEl = this.group.append('text')
      }
      this.valueEl.attr('class', this.data.className)
        .attr('transform', `translate(0, 0)`)
        .attr('text-anchor', 'middle')
        .attr('x', 0)
        .attr('y', 0)
        .attr('dx', 0)
        .attr('dy', 0)
        .attr('fill', this.data.color) // 文字颜色
        .attr('font-size', this.data.fontSize)
        .text(this.data.value)
      if (this.unit && this.unit.text) {
        this.unitEl = this.valueEl.append('tspan')
        this.unitEl.text(this.unit.text)
        this.unit.fontSize && this.unitEl.attr('font-size', this.unit.fontSize)
        this.unit.color && this.unitEl.attr('fill', this.unit.color)
      }
    }
  }
  setLabel() {
    if (!this.label) {
      return
    }
    /** 添加label文字 */
    if (!this.labelEl) {
      this.labelEl = this.group.append('text')
    }
    this.labelEl
      .attr('class', this.label.className)
      .attr('transform', `translate(0, 60)`)
      .attr('text-anchor', 'middle')
      .attr('x', 0)
      .attr('y', 0)
      .attr('dx', 0)
      .attr('dy', 0)
      .attr('fill', this.label.color) // 文字颜色
      .attr('font-size', this.label.fontSize)
      .text(this.label.text)
  }
  setRate() {
    if (!this.rate) {
      return
    }
    if (!this.rateEl) {
      this.rateBackground = this.group.append('rect')
      this.rateEl = this.group.append('text')
    }
    let backgroundWidth = this.diameter * 0.25
    let x = 0 - (backgroundWidth / 2)
    let innerPadding = (this.pointerBackgroundWidth + this.pointerBackgroundPadding)
    let y = this.radius - innerPadding
    let textY = this.radius - innerPadding + 30
    this.rateBackground.attr('x', x).attr('y', y)
      .attr('rx', 20).attr('ry', 20)
      .attr('width', backgroundWidth).attr('height', this.rate.backgroundHeight)
      .attr('fill', this.rate.backgroundColor)
    this.rateEl
      .attr('class', this.rate.className)
      .attr('transform', `translate(0, ${textY})`)
      .attr('text-anchor', 'middle')
      .attr('x', 0).attr('y', 0)
      .attr('dx', 0).attr('dy', 0)
      .attr('font-size', this.rate.fontSize)
      .attr('fill', this.rate.color) // 文字颜色
      .text(this.rate.text)
  }
  /**
   * 更新Dashboard的配置
   *
   * @param {*} config
   * @memberof Dashboard
   */
  update(config) {
    const {
      data: {
        value
      },
      rate
    } = config
    if (value) {
      this.setValue(value)
    }
    if (rate) {
      this.rate = _.merge(this.rate, rate)
      this.setRate()
    }
  }

  resize() {}
  validateDimensions(value) {
    return String.prototype.lastIndexOf.call(value, '%') >= 0
  }

  getDashboardWidth(value) {
    if (this.validateDimensions(value)) {
      return document.querySelector(`#${this.id}`).clientWidth
    } else {
      return value
    }
  }

  getDashboardHeight(value) {
    if (this.validateDimensions(value)) {
      return this.diameter
    } else {
      return value
    }
  }
  requiredParam(param) {
    throw new Error(`${param} is required`)
  }
}
