import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">404</p>
          <h1>Page not found</h1>
        </div>
      </div>

      <div className="state-box">
        This route does not exist. <Link to="/">Go back to dashboard</Link>.
      </div>
    </section>
  )
}
