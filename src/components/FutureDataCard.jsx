export default function FutureDataCard() {
  return (
    <section className="future-card">
      <div>
        <p className="eyebrow">Why Does This Data Matter?</p>
        <h3>Process Dataset → More Advanced AI</h3>
      </div>

      <div className="data-grid">
        <div>
          <strong>Customer Order</strong>
          <span>dimensions, material, quantity, target pressure</span>
        </div>

        <div>
          <strong>BFM Parameters</strong>
          <span>temperatures, pressure, stretch, cycle time</span>
        </div>

        <div>
          <strong>Production Data</strong>
          <span>balloons produced per shift, defects, yield</span>
        </div>

        <div>
          <strong>Future Learning</strong>
          <span>predict the best setups and reduce trial-and-error</span>
        </div>
      </div>

      {/* <p>
        Every validated order becomes a structured training example. As NATEC
        collects more production data, the AI can recommend more accurate
        machine parameters, detect process drift, and support production
        scalability.
      </p> */}
    </section>
  );
}