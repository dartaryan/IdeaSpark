/**
 * ThemeTest Component
 * Temporary component to verify PassportCard theme is applied correctly
 * Shows all DaisyUI components with theme styling for visual verification
 */
export function ThemeTest() {
  return (
    <div className="p-8 space-y-8 bg-base-200 min-h-screen">
      <h1 className="text-3xl font-bold text-base-content">
        PassportCard Theme Test
      </h1>
      
      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <button className="btn btn-primary">Primary</button>
          <button className="btn btn-secondary">Secondary</button>
          <button className="btn btn-accent">Accent</button>
          <button className="btn btn-ghost">Ghost</button>
          <button className="btn btn-outline">Outline</button>
        </div>
        <div className="flex flex-wrap gap-4">
          <button className="btn btn-primary btn-sm">Small</button>
          <button className="btn btn-primary">Normal</button>
          <button className="btn btn-primary btn-lg">Large</button>
        </div>
      </section>
      
      {/* Cards */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Card</h2>
        <div className="card bg-base-100 shadow-xl w-96">
          <div className="card-body">
            <h2 className="card-title">Card Title</h2>
            <p>Card content with PassportCard styling</p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary">Action</button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Inputs */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Inputs</h2>
        <div className="flex flex-col gap-4 max-w-md">
          <input type="text" placeholder="Text input" className="input input-bordered w-full" />
          <input type="text" placeholder="Primary input" className="input input-bordered input-primary w-full" />
          <textarea className="textarea textarea-bordered" placeholder="Textarea"></textarea>
          <select className="select select-bordered w-full" defaultValue="">
            <option disabled value="">Select option</option>
            <option>Option 1</option>
            <option>Option 2</option>
          </select>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Checkbox</span>
              <input type="checkbox" className="checkbox checkbox-primary" defaultChecked />
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Toggle</span>
              <input type="checkbox" className="toggle toggle-primary" defaultChecked />
            </label>
          </div>
        </div>
      </section>
      
      {/* Badges */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Badges</h2>
        <div className="flex flex-wrap gap-2">
          <span className="badge badge-primary">Primary</span>
          <span className="badge badge-secondary">Secondary</span>
          <span className="badge badge-accent">Accent</span>
          <span className="badge badge-ghost">Ghost</span>
          <span className="badge badge-outline">Outline</span>
        </div>
      </section>
      
      {/* Alerts */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Alerts</h2>
        <div className="flex flex-col gap-4">
          <div className="alert alert-info">
            <span>Info alert message</span>
          </div>
          <div className="alert alert-success">
            <span>Success alert message</span>
          </div>
          <div className="alert alert-warning">
            <span>Warning alert message</span>
          </div>
          <div className="alert alert-error">
            <span>Error alert message</span>
          </div>
        </div>
      </section>
      
      {/* Modal */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Modal</h2>
        <button className="btn btn-primary" onClick={() => (document.getElementById('test_modal') as HTMLDialogElement)?.showModal()}>
          Open Modal
        </button>
        <dialog id="test_modal" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Modal Title</h3>
            <p className="py-4">Modal content with PassportCard theme styling</p>
            <div className="modal-action">
              <form method="dialog">
                <button className="btn btn-primary">Close</button>
              </form>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </section>
      
      {/* Progress & Loading */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Progress & Loading</h2>
        <div className="flex flex-col gap-4 max-w-md">
          <progress className="progress progress-primary w-full" value="70" max="100"></progress>
          <progress className="progress progress-secondary w-full" value="50" max="100"></progress>
          <div className="flex gap-4">
            <span className="loading loading-spinner loading-md text-primary"></span>
            <span className="loading loading-dots loading-md text-primary"></span>
            <span className="loading loading-ring loading-md text-primary"></span>
          </div>
        </div>
      </section>
      
      {/* Tabs */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Tabs</h2>
        <div role="tablist" className="tabs tabs-boxed">
          <a role="tab" className="tab tab-active">Tab 1</a>
          <a role="tab" className="tab">Tab 2</a>
          <a role="tab" className="tab">Tab 3</a>
        </div>
      </section>
      
      {/* Color Swatches */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Color Palette</h2>
        <div className="flex flex-wrap gap-4">
          <div className="w-24 h-24 bg-primary rounded-box flex items-center justify-center text-primary-content text-xs font-medium">
            Primary<br/>#E10514
          </div>
          <div className="w-24 h-24 bg-secondary rounded-box flex items-center justify-center text-secondary-content text-xs font-medium">
            Secondary<br/>#1D1C1D
          </div>
          <div className="w-24 h-24 bg-accent rounded-box flex items-center justify-center text-accent-content text-xs font-medium">
            Accent<br/>#FF6B35
          </div>
          <div className="w-24 h-24 bg-base-100 border rounded-box flex items-center justify-center text-base-content text-xs font-medium">
            Base-100<br/>#FFFFFF
          </div>
          <div className="w-24 h-24 bg-base-200 rounded-box flex items-center justify-center text-base-content text-xs font-medium">
            Base-200<br/>#F5F4F2
          </div>
          <div className="w-24 h-24 bg-base-300 rounded-box flex items-center justify-center text-base-content text-xs font-medium">
            Base-300<br/>#E8E6E3
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="w-24 h-24 bg-info rounded-box flex items-center justify-center text-info-content text-xs font-medium">Info</div>
          <div className="w-24 h-24 bg-success rounded-box flex items-center justify-center text-success-content text-xs font-medium">Success</div>
          <div className="w-24 h-24 bg-warning rounded-box flex items-center justify-center text-warning-content text-xs font-medium">Warning</div>
          <div className="w-24 h-24 bg-error rounded-box flex items-center justify-center text-error-content text-xs font-medium">Error</div>
        </div>
      </section>
      
      {/* Border Radius Check */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Border Radius (20px / 1.25rem)</h2>
        <div className="flex gap-4 items-center">
          <div className="w-32 h-20 bg-primary rounded-box flex items-center justify-center text-primary-content text-xs">rounded-box</div>
          <button className="btn btn-primary">rounded-field</button>
          <span className="badge badge-primary p-4">rounded-selector</span>
        </div>
        <p className="text-sm text-base-content/70">
          DaisyUI 5 uses: --radius-box, --radius-field, --radius-selector
        </p>
      </section>
      
      {/* Typography */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Typography (Montserrat)</h2>
        <div className="space-y-2">
          <p className="font-normal">Font weight 400 - Regular</p>
          <p className="font-medium">Font weight 500 - Medium</p>
          <p className="font-semibold">Font weight 600 - Semibold</p>
          <p className="font-bold">Font weight 700 - Bold</p>
        </div>
      </section>
    </div>
  );
}
