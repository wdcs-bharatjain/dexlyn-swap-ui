import { Defs, LinearGradient, Path, Stop, Svg } from 'react-native-svg'

// eslint-disable-next-line no-relative-import-paths/no-relative-import-paths
import { createIcon } from '../factories/createIcon'

export const [UniswapX, AnimatedUniswapX] = createIcon({
  name: 'UniswapX',
  getIcon: (props) => (
    <Svg fill="none" viewBox="0 0 10 14" {...props}>
      <Defs>
        <LinearGradient
          gradientUnits="userSpaceOnUse"
          id="uniswap_x_gradient"
          x1="-10.1807"
          x2="10.6573"
          y1="-12.0006"
          y2="-11.6017">
          <Stop stopColor="#4673FA" />
          <Stop offset="1" stopColor="#9646FA" />
        </LinearGradient>
      </Defs>
      <Path
        d="M9.97131 6.19803C9.91798 6.07737 9.79866 6.00003 9.66666 6.00003H6.66666V1.00003C6.66666 0.862034 6.58201 0.738037 6.45267 0.688704C6.32267 0.638704 6.17799 0.674696 6.08532 0.776696L0.0853237 7.44336C-0.00267631 7.54136 -0.0253169 7.68137 0.0286831 7.80204C0.0820164 7.9227 0.20133 8.00003 0.33333 8.00003H3.33333V13C3.33333 13.138 3.41799 13.262 3.54732 13.3114C3.58665 13.326 3.62666 13.3334 3.66666 13.3334C3.75933 13.3334 3.85 13.2947 3.91467 13.2227L9.91467 6.55603C10.0027 6.4587 10.0246 6.31803 9.97131 6.19803Z"
        fill="url(#uniswap_x_gradient)"
      />
    </Svg>
  ),
})
