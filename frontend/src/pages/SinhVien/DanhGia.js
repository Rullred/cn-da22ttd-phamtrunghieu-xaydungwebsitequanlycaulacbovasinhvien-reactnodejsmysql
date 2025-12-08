import React, { useState } from 'react';
import { FaStar, FaCommentDots, FaPaperPlane, FaCheckCircle } from 'react-icons/fa';
import { danhgiaService } from '../../services/api';
import './DanhGia.css';

const DanhGia = () => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    { value: 'giao_dien', label: 'Giao diện' },
    { value: 'tinh_nang', label: 'Tính năng' },
    { value: 'hieu_nang', label: 'Hiệu năng' },
    { value: 'ho_tro', label: 'Hỗ trợ' },
    { value: 'khac', label: 'Khác' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Vui lòng chọn số sao đánh giá');
      return;
    }

    if (!category) {
      alert('Vui lòng chọn danh mục đánh giá');
      return;
    }

    setSubmitting(true);

    try {
      await danhgiaService.createRating({ rating, feedback, category });
      
      setSubmitted(true);
      setTimeout(() => {
        setRating(0);
        setFeedback('');
        setCategory('');
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error('Submit rating error:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="danh-gia-sv-container">
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon">
            <FaCommentDots size={32} />
          </div>
          <div>
            <h1>Đánh Giá Website</h1>
            <p>Ý kiến của bạn giúp chúng tôi cải thiện dịch vụ</p>
          </div>
        </div>
      </div>

      <div className="rating-content">
        {submitted ? (
          <div className="success-message">
            <FaCheckCircle size={64} className="success-icon" />
            <h2>Cảm ơn đánh giá của bạn!</h2>
            <p>Chúng tôi sẽ xem xét và cải thiện dịch vụ</p>
          </div>
        ) : (
          <div className="rating-form-card">
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h3>Bạn đánh giá website như thế nào?</h3>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-button ${star <= (hoveredRating || rating) ? 'active' : ''}`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                    >
                      <FaStar size={48} />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="rating-text">
                    {rating === 1 && 'Rất tệ'}
                    {rating === 2 && 'Tệ'}
                    {rating === 3 && 'Trung bình'}
                    {rating === 4 && 'Tốt'}
                    {rating === 5 && 'Xuất sắc'}
                  </p>
                )}
              </div>

              <div className="form-section">
                <label htmlFor="category">Danh mục đánh giá *</label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-select"
                  required
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-section">
                <label htmlFor="feedback">Nhận xét chi tiết (tuỳ chọn)</label>
                <textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn về website..."
                  rows="6"
                  className="form-textarea"
                />
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={submitting || rating === 0 || !category}
              >
                {submitting ? (
                  <>
                    <div className="spinner-small"></div>
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    Gửi đánh giá
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        <div className="rating-info">
          <h3>Tại sao đánh giá quan trọng?</h3>
          <ul>
            <li>Giúp chúng tôi hiểu rõ nhu cầu của bạn</li>
            <li>Cải thiện trải nghiệm người dùng</li>
            <li>Phát triển tính năng mới phù hợp hơn</li>
            <li>Nâng cao chất lượng dịch vụ</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DanhGia;
