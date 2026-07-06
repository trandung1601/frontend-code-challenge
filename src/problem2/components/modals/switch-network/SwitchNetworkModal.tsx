import { FiX, FiChevronDown, FiShield } from 'react-icons/fi'
import type { Network } from '../../../lib/networks'
import TokenIcon from '../../ui/TokenIcon'
import './SwitchNetworkModal.scss'

export default function SwitchNetworkModal({
  from,
  to,
  onConfirm,
  onCancel,
}: {
  from: Network
  to: Network
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="sn-overlay" onClick={onCancel}>
      <div className="sn-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sn-header">
          <span className="sn-title">Switch network</span>
          <button className="sn-close" onClick={onCancel}><FiX /></button>
        </div>

        {/* Site info */}
        <div className="sn-site">
          <div className="sn-site-logo">9</div>
          <div className="sn-site-info">
            <span className="sn-site-name">99Tech Swap</span>
            <span className="sn-site-url">99techswap.app</span>
            <span className="sn-site-verified"><FiShield /> Verified by 99Tech</span>
          </div>
        </div>

        {/* Body */}
        <div className="sn-body">
          <h3 className="sn-question">Allow this site to switch networks?</h3>
          <p className="sn-desc">This will switch the network to a previously added network.</p>

          {/* From / To */}
          <div className="sn-route">
            <div className="sn-route-row">
              <span className="sn-route-side">From:</span>
              <div className="sn-route-net">
                <TokenIcon symbol={from.icon} size={26} />
                <div>
                  <div className="sn-net-name">{from.name}</div>
                  <div className="sn-net-rpc">{from.rpc}</div>
                </div>
              </div>
            </div>

            <div className="sn-route-arrow"><FiChevronDown /></div>

            <div className="sn-route-row">
              <span className="sn-route-side">To:</span>
              <div className="sn-route-net">
                <TokenIcon symbol={to.icon} size={26} />
                <div>
                  <div className="sn-net-name">{to.name}</div>
                  <div className="sn-net-rpc">{to.rpc}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="sn-actions">
          <button className="sn-btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="sn-btn-confirm" onClick={onConfirm}>Switch network</button>
        </div>
      </div>
    </div>
  )
}
