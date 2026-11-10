export function RouteArt() {
  return (
    <div className="route-art" aria-hidden="true">
      <div className="art-grid" />
      <span className="art-kicker">ВАША СЛЕДУЮЩАЯ ТОЧКА РОСТА</span>
      <svg viewBox="0 0 520 440" fill="none">
        <path
          d="M-30 365H120Q155 365 155 330V245Q155 210 190 210H290Q325 210 325 175V100Q325 65 360 65H540"
          stroke="#e4e5e7"
          strokeWidth="60"
        />
        <path
          d="M-30 365H120Q155 365 155 330V245Q155 210 190 210H290Q325 210 325 175V100Q325 65 360 65H540"
          stroke="white"
          strokeWidth="2"
          strokeDasharray="5 8"
        />
        <path
          d="M-30 365H120Q155 365 155 330V245Q155 210 190 210H260"
          stroke="#ef3124"
          strokeWidth="60"
        />
        <path
          d="M-30 365H120Q155 365 155 330V245Q155 210 190 210H260"
          stroke="#fff"
          strokeOpacity=".5"
          strokeWidth="2"
          strokeDasharray="5 8"
        />
        <circle
          cx="263"
          cy="210"
          r="22"
          fill="#151515"
          stroke="white"
          strokeWidth="7"
        />
        <path d="m256 210 5 5 9-10" stroke="white" strokeWidth="2" />
        <circle cx="398" cy="65" r="9" fill="#151515" />
      </svg>
      <div className="art-note note-one">
        <span className="tiny-dot" />
        Есть задача
      </div>
      <div className="art-note note-two">
        Понятный следующий шаг <span>↗</span>
      </div>
      <div className="art-caption">
        <span>Не нужно знать всё.</span>
        <strong>
          Достаточно знать,
          <br />с чего начать.
        </strong>
      </div>
    </div>
  );
}
