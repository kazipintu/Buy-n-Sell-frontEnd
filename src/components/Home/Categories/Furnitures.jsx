import React, { useEffect, useState, useContext } from 'react';
import { LuCheckCircle } from 'react-icons/lu';
import { AuthContext } from '../../../contexts/AuthProvider'; // Import AuthContext
import toast from 'react-hot-toast';

const Furnitures = () => {
  const { user } = useContext(AuthContext);
  const [isBuyer, setIsBuyer] = useState(false);
  const [availableFurnitures, setAvailableFurnitures] = useState([]);
  const [selectedFurniture, setSelectedFurniture] = useState(null);
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [sellerVerificationStatus, setSellerVerificationStatus] = useState({});

  // Fetch available furniture data from the server
  useEffect(() => {
    fetch("http://localhost:5000/availableFurnitures")
      .then((res) => res.json())
      .then((data) => setAvailableFurnitures(data));
  }, []);

  // Fetch user type (buyer) from the server
  useEffect(() => {
    if (user?.email) {
      fetch(`http://localhost:5000/users/buyer/${user.email}`)
        .then((res) => res.json())
        .then((data) => setIsBuyer(data?.isBuyer));
    }
  }, [user?.email]);

  // Fetch seller verification status for each furniture
  useEffect(() => {
    if (availableFurnitures.length > 0) {
      availableFurnitures.forEach((furniture) => {
        fetch(`http://localhost:5000/users/seller/${furniture.sellerEmail}`)
          .then((res) => res.json())
          .then((data) => {
            setSellerVerificationStatus((prevState) => ({
              ...prevState,
              [furniture?.sellerEmail]: data?.emailVerified
            }));
          });
      });
    }
  }, [availableFurnitures]);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleOpenModal = (furniture) => {
    setSelectedFurniture(furniture);
  };

  const handleCloseModal = () => {
    setSelectedFurniture(null);
  };

  const handleBooking = (event) => {
    event.preventDefault();
    const form = event.target;

    const buyerName = form.name.value;
    const buyerEmail = form.email.value;
    const buyerPhone = form.phone.value;
    const productName = form.product.value;
    const condition = form.condition.value;
    const productPrice = form.price.value;
    const meetingLocation = form.location.value;
    const category = form.category.value;

    const booking = {
      buyerName,
      buyerEmail,
      buyerPhone,
      productName,
      condition,
      productPrice,
      meetingLocation,
      category,
    };

    fetch('http://localhost:5000/bookings', {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(booking),
    })
      .then(response => response.json())
      .then(data => {
        if (data.acknowledged) {
          setSelectedFurniture(null);
          toast.success("Booking confirmed!");
        } else {
          toast.error("Booking failed");
        }
      })
      .catch((error) => {
        console.error("Error submitting booking:", error);
        toast.error("An error occurred while posting the data.");
      });
  };

  const handleBookingConfirm = (id) => {
    //console.log("handleBookingConfirm", id);
    fetch(`http://localhost:5000/bookings/${id}`, {
      method: "PUT",
    })
      .then(res => res.json())
      .then(data => console.log(data));
  };




  return (
    <div className='bg-slate-100 py-[100px]'>
      <h1 className='w-1/2 mx-auto text-3xl lg:text-5xl text-center font-bold text-blue-500 capitalize tracking-wide'>
        Discover your affordable and durable <span className='underline'>Furnitures - {availableFurnitures?.length} no.</span>
      </h1>
      <div className='lg:w-[95%] px-[1%] mx-auto pt-[70px]'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {availableFurnitures?.map((furniture) => (
            <div key={furniture?._id} className='border hover:border-none shadow-2xl hover:shadow-none bg-white rounded-2xl overflow-hidden relative team-card p-4'>
              <div className="overflow-hidden relative space-x-2 text-center">
                <img
                  className="inline w-[300px] object-contain h-[250px] hover:scale-110 scale-100 transition-all duration-500"
                  src={furniture?.picture}
                  alt="furniture" />
              </div>
              <div className="w-full bg-white tracking-wider px-5 pb-5 flex justify-between items-end">
                <div className='text-left space-y-2'>
                  <h4 className="text-xl font-bold text-blue-900">{furniture?.productName}</h4>
                  <p className='text-blue-900/85 text-md font-semibold'>Condition: {furniture?.condition}</p>
                  <p className='text-orange-600 text-lg font-bold text-blue-900/85'>Price: Rs. {furniture?.offerPrice}</p>
                  <p className='text-blue-900/85 text-md font-semibold'>Bought-by: Rs. {furniture?.originalPrice}</p>
                  <p className='text-blue-900/85 text-md font-semibold'>How-old: {furniture?.howOld}</p>
                  <p className='text-blue-900/85 text-md font-semibold'>Posted-on: {furniture?.postedOn}</p>
                  <p className='text-blue-900/85 text-md font-semibold'>Location: {furniture?.location}</p>
                  <p className='flex gap-2 items-center text-green-500 text-lg font-semibold'>
                    Seller: {furniture?.sellerEmail}
                    {sellerVerificationStatus[furniture?.sellerEmail] && (
                      <LuCheckCircle className="size-6 font-bold text-blue-700" />
                    )}
                  </p>
                </div>
                <div>
                  {isBuyer ? (
                    <button onClick={() => handleOpenModal(furniture)} className="btn btn-neutral"> Book Now </button>
                  ) : (
                    <button disabled className="btn btn-disabled"> For Buyers </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedFurniture && (
        <div className="modal modal-open" role="dialog">
          <form onSubmit={handleBooking} className="modal-box">
            <div className='flex justify-between'>
              <h3 className="text-lg font-bold">{selectedFurniture?.category}</h3>
              <button type="button" onClick={handleCloseModal} className="btn btn-circle btn-sm rounded-full bg-accent text-white" > X </button>
            </div>
            <div className='mb-5'>
              <input type="text" name="name" value={user?.displayName || ''} placeholder="Full name" className="input input-bordered w-full mt-4" disabled />
              <input type="email" name="email" value={user?.email || ''} placeholder="Email id" className="input input-bordered w-full mt-4" disabled />
              <input type="text" name="category" value={selectedFurniture?.category} placeholder="Product category" className="input input-bordered w-full mt-4" disabled />
              <input type="text" name="product" value={selectedFurniture?.productName} placeholder="Product name" className="input input-bordered w-full mt-4" disabled />
              <input type="text" name="condition" value={selectedFurniture?.condition} placeholder="Product condition" className="input input-bordered w-full mt-4" disabled />
              <input type="number" name="price" value={selectedFurniture?.offerPrice} placeholder="Product price" className="input input-bordered w-full mt-4" disabled />
              <input type="number" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="input input-bordered w-full mt-4" required />
              <input type="text" name="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Meeting location" className="input input-bordered w-full mt-4" required />
            </div>
            <input type="submit" value="Submit" className="w-full btn btn-neutral" />
          </form>
        </div>
      )}
    </div>
  );
};

export default Furnitures;
