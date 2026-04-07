import React from 'react';

const Pagination = ({ meta, onPageChange }) => {
    const { current_page, last_page, total, from, to } = meta;

    if (!last_page || last_page <= 1) return null;

    
    const buildPages = () => {
        const delta = 2;
        const pages = [];
        let prev = null;

        for (let i = 1; i <= last_page; i++) {
            const show =
                i === 1 ||
                i === last_page ||
                (i >= current_page - delta && i <= current_page + delta);

            if (show) {
                if (prev !== null && i - prev > 1) {
                    pages.push({ type: 'ellipsis', key: `e-${i}` });
                }
                pages.push({ type: 'page', number: i, key: i });
                prev = i;
            }
        }
        return pages;
    };

    const pages = buildPages();

    return (
        <div className="sp-pagination">
            
            <div className="sp-pagination-info">
                {from && to ? (
                    <>Affichage <strong>{from}</strong>–<strong>{to}</strong> sur <strong>{total}</strong> résultats</>
                ) : (
                    <>{total} résultats au total</>
                )}
            </div>

            
            <div className="sp-pagination-buttons">
                
                <button
                    className="sp-page-btn"
                    onClick={() => onPageChange(current_page - 1)}
                    disabled={current_page === 1}
                    title="Page précédente"
                >
                    <i className="bi bi-chevron-left" style={{ fontSize: 12 }} />
                </button>

                
                {pages.map(p =>
                    p.type === 'ellipsis' ? (
                        <span
                            key={p.key}
                            style={{
                                width: 34,
                                textAlign: 'center',
                                color: 'var(--text-muted)',
                                fontSize: 13,
                                userSelect: 'none',
                            }}
                        >
                            …
                        </span>
                    ) : (
                        <button
                            key={p.key}
                            className={`sp-page-btn ${p.number === current_page ? 'active' : ''}`}
                            onClick={() => onPageChange(p.number)}
                        >
                            {p.number}
                        </button>
                    )
                )}

                
                <button
                    className="sp-page-btn"
                    onClick={() => onPageChange(current_page + 1)}
                    disabled={current_page === last_page}
                    title="Page suivante"
                >
                    <i className="bi bi-chevron-right" style={{ fontSize: 12 }} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
