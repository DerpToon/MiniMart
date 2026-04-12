import '../css/RouteLoadingScreen.css'

type RouteLoadingScreenProps = {
  message?: string
}

export default function RouteLoadingScreen({
  message = 'Loading your page...'
}: RouteLoadingScreenProps) {
  return (
    <section className="route-loading-screen" aria-live="polite" aria-busy="true">
      <div className="route-loading-card">
        <p className="route-loading-kicker">MiniMart</p>
        <h2>{message}</h2>
        <div className="route-loading-bar">
          <span />
        </div>
      </div>
    </section>
  )
}
