const lcjs = require('@lightningchart/lcjs')
const {
	lightningChart, 
	Themes, 
	LUT, 
	regularColorSteps, 
	BarChartTypes, 
	SolidFill, 
	ColorHEX, 
	AxisTickStrategies,
	htmlTextRenderer, 
	emptyLine, 
	FontSettings,
	FormattingFunctions,
	LegendPosition,
} = lcjs

const exampleContainer = document.getElementById('chart') || document.body
if (exampleContainer === document.body) {
	exampleContainer.style.width = '100vw'
	exampleContainer.style.height = '100vh'
	exampleContainer.style.margin = '0px'
}
exampleContainer.style.display = 'flex'
exampleContainer.style.flexDirection = 'column'
exampleContainer.style.overflow = 'hidden'
exampleContainer.style.gap = '0'
const parallelLayout = document.createElement('div')
exampleContainer.append(parallelLayout)
parallelLayout.style.gap = '0'
parallelLayout.style.width = '100%'
parallelLayout.style.height = '60%'
const chartsLayout = document.createElement('div')
exampleContainer.append(chartsLayout)
chartsLayout.style.display = 'flex'
chartsLayout.style.flexDirection = 'row'
chartsLayout.style.gap = '0'
chartsLayout.style.width = '100%'
chartsLayout.style.height = '40%'

// Color palette for bottom row charts
const fuelPalette = {
	Petrol: ColorHEX('#C66BAA'),  
	Diesel: ColorHEX('#4EA3FF'),  
	Electric: ColorHEX('#B58BFF'), 
	Hybrid: ColorHEX('#38C6A6'),  
	default: ColorHEX('#eed86dff'),  
}

// Initial range selector values
const [pStart, pEnd] = [24, 100]
const [hpStart, hpEnd] = [200, 540]

const lc = lightningChart({
            resourcesBaseUrl: new URL(document.head.baseURI).origin + new URL(document.head.baseURI).pathname + 'resources/',
        })

// Parallel Coordinate Chart
const containerChart1 = document.createElement('div')
parallelLayout.append(containerChart1)
const parallelChart = lc
  .ParallelCoordinateChart({ 
    theme: Themes.darkGold, 
    container: containerChart1,
    textRenderer: htmlTextRenderer, 
		legend: {
			position: LegendPosition.RightCenter
		}
  })
  .setTitle("Car Characteristics - Double Click on Axis to Filter")
  .setPadding({ left: 10, right: 10, top: 0, bottom: 15 })
containerChart1.style.width = '100%'
containerChart1.style.height = '100%'

const theme = parallelChart.getTheme()
const Axes = { 
	Price: 0, 
	Horsepower: 1,
	Weight: 2, 
	FuelEfficiency: 3 
}
parallelChart.setAxes(Axes)
parallelChart.getAxis(Axes.FuelEfficiency).setInterval({ start: 1.50, end: 6.25 })
parallelChart.setLUT({
	axis: parallelChart.getAxis(Axes.FuelEfficiency),
	lut: new LUT({
		interpolate: true,
		steps: regularColorSteps(1.50, 6.25, theme.examples.badGoodColorPalette),
	}),
})
// Initial range selector
parallelChart.getAxis(Axes.Price).addRangeSelector().setInterval(pStart, pEnd)
parallelChart.getAxis(Axes.Horsepower).addRangeSelector().setInterval(hpStart, hpEnd)

// Horizontal Bar Chart
const containerChart2 = document.createElement('div')
chartsLayout.append(containerChart2)
const modelsChart = lc
	.BarChart({
		theme: Themes.darkGold,
		container: containerChart2,
		legend: { addEntriesAutomatically: false },
		type: BarChartTypes.Horizontal,
		textRenderer: htmlTextRenderer, 
	})
	.setTitle("Models by Manufacturer")
	.setTitleFont(new FontSettings({ size: 15 }))
	.setTitleMargin({ top: 5 })
	.setValueLabels(undefined)
	.setCornerRadius(undefined) 
	.setBarsMargin(0.1)
	.setPadding({ left: 20, right: 20, top: 0, bottom: 10 })
containerChart2.style.width = '25%'
containerChart2.style.height = '100%'
modelsChart.valueAxis.setTickStrategy(AxisTickStrategies.Numeric, (ticks) => ticks.setMajorFormattingFunction(FormattingFunctions.NumericUnits))

// Vertical Bar Chart
const containerChart3 = document.createElement('div')
chartsLayout.append(containerChart3)
const fuelPriceChart = lc
	.BarChart({
		theme: Themes.darkGold,
		container: containerChart3,
		legend: { addEntriesAutomatically: false },
		type: BarChartTypes.Vertical,
		textRenderer: htmlTextRenderer, 
	})
	.setTitle("Average Price per Fuel Type")
	.setTitleFont(new FontSettings({ size: 15 }))
	.setTitleMargin({ top: 5, bottom: 20 })
	.setValueLabels({
		formatter: (info) => `$${(info.value).toFixed(0)}k`,
	})
	.setCornerRadius(3) 
	.setBarsMargin(0.15)
	.setPadding({ left: 10, right: 10, top: 0, bottom: 5 })
containerChart3.style.width = '20%'
containerChart3.style.height = '100%'
fuelPriceChart.valueAxis.setTickStrategy(AxisTickStrategies.Numeric, ticks => ticks
	.setMajorFormattingFunction((value) => `${value.toFixed(0)}`)
)

// Scatter Chart
const containerChart4 = document.createElement('div')
chartsLayout.append(containerChart4)
const weightFEChart = lc
	.ChartXY({ 
		theme: Themes.darkGold, 
		container: containerChart4, 
		textRenderer: htmlTextRenderer, 
	})
	.setTitle("Fuel Efficiency vs Weight")
	.setTitleFont(new FontSettings({ size: 15 }))
	.setCursorMode('show-nearest')
	.setPadding({ left: 10, right: 10, top: 5, bottom: 5 })
containerChart4.style.width = '27.5%'
containerChart4.style.height = '100%'

const wAxisX = weightFEChart.getDefaultAxisX().setTitle("Weight (kg)").setTitleFont(new FontSettings({ size: 14 }))
const wAxisY = weightFEChart.getDefaultAxisY().setTitle("Fuel Efficiency (km/kWh)").setTitleFont(new FontSettings({ size: 14 }))
wAxisY.setTickStrategy(AxisTickStrategies.Numeric, ticks => ticks
	.setMajorFormattingFunction((value) => `${value.toFixed(0)}`)
)
    
// Get or create series per fuel type
const scatterByFuel = {}

const getScatterForFuel = (fuel) => {
	if (scatterByFuel[fuel]) return scatterByFuel[fuel]
	const series = weightFEChart.addPointSeries({ 
		schema: {
			x: { pattern: 'progressive' },
			y: { pattern: null }
		},		
		pointShape: "Circle" 
	})
	series
		.setPointSize(8)
		.setName(fuel)
		.setPointFillStyle(new SolidFill({ color: fuelPalette[fuel] || fuelPalette.default }))
	scatterByFuel[fuel] = series
	return series
}

// Box and whiskers Chart
const containerChart5 = document.createElement('div')
chartsLayout.append(containerChart5)
const horsepowerChart = lc
	.ChartXY({
		theme: Themes.darkGold,
		container: containerChart5,
		textRenderer: htmlTextRenderer,
		legend: { addEntriesAutomatically: false },
	})
	.setTitle("Horsepower Distribution per Fuel Type")
	.setTitleFont(new FontSettings({ size: 15 }))
	.setCursorMode(undefined)
	.setPadding({ left: 10, right: 10, top: 5, bottom: 5 })
containerChart5.style.width = '27.5%'
containerChart5.style.height = '100%'

const hpAxisX = horsepowerChart
	.getDefaultAxisX()
	.setTickStrategy(AxisTickStrategies.Empty)
	.setTitlePosition("center")

const hpAxisY = horsepowerChart
	.getDefaultAxisY()
	.setTitle("Horsepower (hp)")
	.setTitleFont(new FontSettings({ size: 15 }))
	.setScrollStrategy(undefined)
	.setInterval({ start: 100, end: 550, stopAxisAfter: false })

// Get or create box and point series per fuel type
const boxByFuel = {}
const pointsByFuel = {}
const hpTicksByFuel = {} 
const fuelsOrdered = ["Petrol", "Diesel", "Electric", "Hybrid"]

fuelsOrdered.forEach((fuel, i) => {
	const tick = hpAxisX.addCustomTick()  
	tick.setValue(i + 0.5) 
	tick.setTextFormatter(() => fuel)
	tick.setGridStrokeLength(0)
	hpTicksByFuel[fuel] = tick  
})

function getBoxForFuel(fuel) {
	if (boxByFuel[fuel]) return boxByFuel[fuel]

	const boxSeries = horsepowerChart
		.addBoxSeries()
		.setDefaultStyle((figure) => figure
			.setBodyWidth(0.8)
			.setTailWidth(0.7)
			.setBodyFillStyle(new SolidFill({ color: fuelPalette[fuel] || fuelPalette.default }))
		)
	boxByFuel[fuel] = boxSeries
	return boxSeries
}

function getPointsForFuel(fuel) {
	if (pointsByFuel[fuel]) return pointsByFuel[fuel]
	const pointSeries = horsepowerChart
		.addPointSeries({})
		.setStrokeStyle(emptyLine)
		.setPointSize(8)
		.setPointFillStyle(new SolidFill({ color: fuelPalette[fuel] || fuelPalette.default }))
	pointsByFuel[fuel] = pointSeries
	return pointSeries
}

fetch(document.head.baseURI + 'examples/assets/1707/cars.json')
	.then((r) => r.json())
	.then((data) => {
		// Update parallel chart
		data.forEach((sample) => {
			const series = parallelChart.addSeries()
			series.setName(`${sample.Manufacturer} ${sample.Model} (${sample.Fuel})`).setData(sample)
		})

		// Update horizontal bar chart
		function updateModelsChart(samples) {
			if (!modelsChart || modelsChart.isDisposed()) return
			if (!samples?.length) {
				modelsChart.setDataGrouped(["No selection"], [{ subCategory: "Count", values: [0] }])
				return
			}

			// Compute counts per manufacturer and fuel
			const manufacturers = [...new Set(samples.map((s) => s.Manufacturer))]
			const fuels = [...new Set(samples.map((s) => s.Fuel))]
			const valuesByFuel = fuels.map((fuel) =>
				manufacturers.map((m) => samples.filter((s) => s.Manufacturer === m && s.Fuel === fuel).length)
			)

			// Set data
			const stacked = fuels.map((fuel, i) => ({
				subCategory: fuel,
				values: valuesByFuel[i],
			}))
			modelsChart.setDataStacked(manufacturers, stacked)

			// Apply colors to each fuel sub-bar
			manufacturers.forEach((m) => {
				fuels.forEach((fuel) => {
					const bar = modelsChart.getBar(m, fuel)
					if (bar) bar.setFillStyle(new SolidFill({ color: fuelPalette[fuel] || fuelPalette.default }))
				})
			})
		}

		// Update vertical bar chart
		function updateAvgPriceChart(samples) {
			if (!fuelPriceChart || fuelPriceChart.isDisposed()) return
			if (!samples?.length) {
				fuelPriceChart.setDataGrouped(["No selection"], [{ subCategory: "Average Price", values: [0] }])
				return
			}

			// Compute average price per fuel
			const fuels = [...new Set(samples.map((s) => s.Fuel))]
			const averages = fuels.map((fuel) => {
				const subset = samples.filter((s) => s.Fuel === fuel)
				return subset.reduce((sum, s) => sum + Number(s.Price || 0), 0) / Math.max(1, subset.length)
			})

			// Set data
			fuelPriceChart.setDataGrouped(fuels, [{ subCategory: "Avg Price", values: averages }])

			// Color each bar by fuel type
			fuels.forEach((fuel) => {
				const bar = fuelPriceChart.getBar(fuel, "Avg Price")
				if (bar) bar.setFillStyle(new SolidFill({ color: fuelPalette[fuel] || fuelPalette.default }))
			})
		}

		// Update scatter chart
		function updateScatterChart(samples) {
			Object.values(scatterByFuel).forEach((s) => s.clear())
			if (!samples?.length) return

			// Group samples by fuel
			const byFuel = samples.reduce((grouped, s) => {
				const f = s.Fuel || "Unknown"
				if (!grouped[f]) grouped[f] = { x: [], y: [] }
				const x = Number(s.Weight)
				const y = Number(s.FuelEfficiency)
				if (Number.isFinite(x) && Number.isFinite(y)) {
					grouped[f].x.push(x)
					grouped[f].y.push(y)
				}
				return grouped
			}, {})

			// Append samples per fuel
			Object.entries(byFuel).forEach(([fuel, { x, y }]) => {
				if (x.length) getScatterForFuel(fuel).appendSamples({ x: x, y: y })
			})

			// Adjust axes ranges dynamically
			const allX = samples.map((s) => Number(s.Weight)).filter(Number.isFinite)
			const allY = samples.map((s) => Number(s.FuelEfficiency)).filter(Number.isFinite)
			if (allX.length && allY.length) {
				wAxisX.setInterval({ start: Math.min(...allX), end: Math.max(...allX) })
				wAxisY.setInterval({ start: Math.min(...allY), end: Math.max(...allY) })
			}
		}

		// Update box and whiskers chart
		function updateHorsepowerChart(samples) {
			if (!horsepowerChart || horsepowerChart.isDisposed()) return
			if (!samples?.length) {
				Object.values(boxByFuel).forEach((s) => s.clear())
				Object.values(pointsByFuel).forEach((s) => s.clear())
				return
			}

			// Group horsepower per fuel
			const byFuel = fuelsOrdered.reduce((grouped, fuel) => {
				grouped[fuel] = samples
					.filter((s) => s.Fuel === fuel)
					.map((s) => Number(s.Horsepower))
					.filter(Number.isFinite)
					.sort((a, b) => a - b)
				return grouped
			}, {})

			const allHP = samples.map((s) => Number(s.Horsepower)).filter(Number.isFinite)
			if (!allHP.length) return

			// Update series per fuel
			fuelsOrdered.forEach((fuel, i) => {
				const values = byFuel[fuel]
				if (!values || values.length === 0) {
						if (boxByFuel[fuel]) boxByFuel[fuel].clear()
						if (pointsByFuel[fuel]) pointsByFuel[fuel].clear()
						return
					}
				const box = getBoxForFuel(fuel)
				const points = getPointsForFuel(fuel)

				box.clear()
				points.clear()

				// Compute quartiles and whiskers
				const q1 = values[Math.floor(0.25 * (values.length - 1))]
				const median = values[Math.floor(0.5 * (values.length - 1))]
				const q3 = values[Math.floor(0.75 * (values.length - 1))]
				const iqr = q3 - q1
				const lowerExtreme = Math.max(Math.min(...values), q1 - 1.5 * iqr)
				const upperExtreme = Math.min(Math.max(...values), q3 + 1.5 * iqr)
				const outliers = values.filter((v) => v < lowerExtreme || v > upperExtreme)

				// Add box and whiskers data
				const start = i
				const end = i + 1
				const middle = (start + end) / 2

				box.add({
					start,
					end,
					lowerExtreme,
					lowerQuartile: q1,
					median,
					upperQuartile: q3,
					upperExtreme,
				})

				outliers.forEach((o) => points.appendSample({ x: middle, y: o }))
			})

			// Adjust Y range dynamically
			hpAxisY.setInterval({ start: Math.min(...allHP) * 0.9, end: Math.max(...allHP) * 1.05, stopAxisAfter: false, })
		}

		// Initial selection
		const initialSelected = data.filter((d) => d.Price >= pStart && d.Price <= pEnd && d.Horsepower >= hpStart && d.Horsepower <= hpEnd)
		updateModelsChart(initialSelected)
		updateAvgPriceChart(initialSelected)
		updateScatterChart(initialSelected)
		updateHorsepowerChart(initialSelected)

		// Range selector event
		parallelChart.addEventListener("seriesselect", (event) => {
			const selectedSeries = event.selectedSeries || []
			const selectedSamples = selectedSeries.map((s) => s.getData())
			updateModelsChart(selectedSamples)
			updateAvgPriceChart(selectedSamples)
			updateScatterChart(selectedSamples)
			updateHorsepowerChart(selectedSamples)
		})
	})

